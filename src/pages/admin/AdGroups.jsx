import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, storage } from "../../config/marian-config.js";
import { collection, addDoc, getDocs, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AdminSidebar from "../../components/sidebar/AdminSidebar.jsx";
import { IoAddOutline, IoArchiveOutline } from "react-icons/io5";
import { FaMinus, FaPlus } from "react-icons/fa";

function AdGroups() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [portfolioManager, setPortfolioManager] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [availableManagers, setAvailableManagers] = useState([]);
  const [availableAdditionalMembers, setAvailableAdditionalMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState(""); // State for validation error
  const [searchTerm, setSearchTerm] = useState(""); // State for the search term
  const [incubateeDropdowns, setIncubateeDropdowns] = useState([{ id: Date.now(), value: "", role: "" }]); // State for dynamic dropdowns
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Admin | Groups"; // Set the page title
  }, []);

  useEffect(() => {
    const fetchUsersAndGroups = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const groupsSnapshot = await getDocs(collection(db, "groups"));

        const users = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const groups = groupsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Collect IDs of users who are already Project Managers in any group
        const projectManagerIds = new Set();
        groups.forEach((group) => {
          group.members.forEach((member) => {
            if (member.role === "Project Manager") {
              projectManagerIds.add(member.id);
            }
          });
        });

        // Filter users for the dropdown
        const availableUsers = users.filter((user) => user.status === "approved");
        setAvailableManagers(availableUsers.filter((user) => user.role === "Portfolio Manager"));
        setAvailableAdditionalMembers(
          availableUsers.filter((user) => {
            // Allow all incubatees but prevent users who are already Project Managers in another startup
            return (
              user.role === "Incubatee" &&
              (!projectManagerIds.has(user.id) || user.role !== "Project Manager")
            );
          })
        );

        // Set groups (filter out archived ones and sort alphabetically by name)
        setGroups(
          groups
            .filter((group) => !group.archived)
            .map((group) => ({
              ...group,
              portfolioManagerDetails: users.find((user) => user.id === group.portfolioManager),
            }))
            .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())) // Sort alphabetically
        );
      } catch (error) {
        console.error("Error fetching users and groups:", error);
      }
    };

    fetchUsersAndGroups();
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;
    if (!portfolioManager) {
      setError("Please assign a Portfolio Manager.");
      return;
    }

    // Check if at least one incubatee has the role of "Project Manager"
    const hasProjectManager = incubateeDropdowns.some(
      (dropdown) => dropdown.role === "Project Manager"
    );

    if (!hasProjectManager) {
      setValidationError("You need a Project Manager to create a startup.");
      return;
    }

    setError(""); // Clear any previous errors
    setValidationError(""); // Clear validation error

    let uploadedImageUrl = "";

    try {
      if (image) {
        const imageRef = ref(storage, `groupImages/${image.name}`);
        await uploadBytes(imageRef, image);
        uploadedImageUrl = await getDownloadURL(imageRef);
        setImageUrl(uploadedImageUrl);
      }

      // Fetch portfolio manager details
      const portfolioManagerDoc = await getDoc(doc(db, "users", portfolioManager));
      const portfolioManagerDetails = { id: portfolioManager, ...portfolioManagerDoc.data() };

      // Prepare members with group roles
      const members = incubateeDropdowns
        .filter((dropdown) => dropdown.value && dropdown.role) // Only include valid selections
        .map((dropdown) => ({
          id: dropdown.value, // User ID
          groupRole: dropdown.role, // Role specific to this group
        }));

      const groupDocRef = await addDoc(collection(db, "groups"), {
        name: groupName,
        description,
        imageUrl: uploadedImageUrl,
        portfolioManager: portfolioManagerDetails,
        members, // Add members with group roles
        createdAt: serverTimestamp(),
      });

      // Create a notification for the portfolio manager
      await addDoc(collection(db, "notifications"), {
        userId: portfolioManager,
        message: `<b style="color:green">You’ve been assigned</b> as the Portfolio Manager for the Group <b>"${groupName}"</b>. Get ready to lead and make an impact!`,
        timestamp: serverTimestamp(),
        read: false,
        groupId: groupDocRef.id, // Add groupId to the notification
        type: "manager", // Notification type for portfolio manager
      });

      setGroupName("");
      setDescription("");
      setImage(null);
      setPortfolioManager("");
      setIncubateeDropdowns([{ id: Date.now(), value: "", role: "" }]); // Reset incubatee dropdowns
      setIsPopupOpen(false);

      // Fetch the updated list of groups
      const querySnapshot = await getDocs(collection(db, "groups"));
      const groupsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setGroups(groupsData.filter((group) => !group.archived));

      // Navigate to the newly created group's details page
      navigate(`/admin/view-group/${groupDocRef.id}`);
    } catch (error) {
      console.error("Error creating group:", error);
      setError("An error occurred while creating the group. Please try again.");
    }
  };

  const handleNavigateToArchives = () => {
    navigate("/admin-groups/archives");
  };

  const filteredGroups = groups.filter((group) => {
    const searchLower = searchTerm.toLowerCase();

    // Check if the search term matches the group name or description
    const matchesNameOrDescription =
      group.name.toLowerCase().includes(searchLower) ||
      group.description.toLowerCase().includes(searchLower);

    // Check if the search term matches the portfolio manager's name
    const matchesPortfolioManager =
      group.portfolioManagerDetails &&
      `${group.portfolioManagerDetails.name} ${group.portfolioManagerDetails.lastname}`
        .toLowerCase()
        .includes(searchLower);

    // Check if the search term matches any member's name
    const matchesMembers =
      group.members &&
      group.members.some((member) =>
        `${member.name} ${member.lastname}`.toLowerCase().includes(searchLower)
      );

    // Return true if any of the above conditions are met
    return matchesNameOrDescription || matchesPortfolioManager || matchesMembers;
  });

  const handleAddDropdown = () => {
    setIncubateeDropdowns([...incubateeDropdowns, { id: Date.now(), value: "", role: "" }]);
  };

  const handleRemoveDropdown = (id) => {
    setIncubateeDropdowns(incubateeDropdowns.filter((dropdown) => dropdown.id !== id));
  };

  const handleDropdownChange = (id, value) => {
    setIncubateeDropdowns(
      incubateeDropdowns.map((dropdown) =>
        dropdown.id === id ? { ...dropdown, value } : dropdown
      )
    );
  };

  const handleRoleChange = (id, role) => {
    // Update the role in the local state
    setIncubateeDropdowns(
      incubateeDropdowns.map((dropdown) =>
        dropdown.id === id ? { ...dropdown, role } : dropdown
      )
    );
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex flex-col items-start h-screen w-full overflow-x-auto p-10">
        <div className="flex flex-row justify-between items-center w-full">
          <h1 className="text-4xl font-bold mb-5">Incubatees</h1>
          <div className="flex gap-2 items-center">
            {/* Search Bar */}
            <input
              type="text"
              placeholder="Search a startup..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border rounded-sm text-sm w-64"
            />
            <button
              onClick={() => setIsPopupOpen(true)}
              className="bg-primary-color text-white p-2 rounded-sm text-sm hover:bg-opacity-80 transition-all flex items-center justify-center gap-1"
            >
              <IoAddOutline className="text-xl" />
              Create New StartUp
            </button>
            <button
              onClick={handleNavigateToArchives}
              className="bg-primary-color text-white p-2 rounded-sm text-sm hover:bg-opacity-80 transition-all flex items-center justify-center"
              title="View Archives"
            >
              <IoArchiveOutline className="text-xl" />
            </button>
          </div>
        </div>

        {/* Displays The Filtered Groups */}
        <div className="mt-5 w-full overflow-y-auto">
          <ul className="border">
            {filteredGroups.map((group, index) => (
              <div
                key={group.id}
                className={`relative ${index % 2 === 0 ? "bg-white" : "bg-gray-100"}`}
              >
                <Link to={`/admin/view-group/${group.id}`}>
                  <li className="p-3 shadow flex justify-between items-center cursor-pointer hover:bg-gray-200 transition">
                    <div className="flex items-center gap-4">
                      {/* Placeholder Profile Image */}
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                        {group.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-sm font-bold">{group.name}</h2>
                        <p className="text-xs">{group.description}</p>
                      </div>
                    </div>
                  </li>
                </Link>
              </div>
            ))}
          </ul>
        </div>
      </div>

      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div
            className="bg-white p-6 rounded-sm text-sm shadow-lg transform scale-95 transition-all animate-fade-in w-[500px] h-[550px] overflow-y-auto"
          >
            <h2 className="text-xl font-bold mb-4 text-center">Create a StartUp</h2>
            <label className="block mb-3 cursor-pointer text-center border border-gray-400 p-3 rounded-sm">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              {image ? "Image Selected" : "Click to upload Image"}
            </label>

            <input
              type="text"
              placeholder="StartUp Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full p-2 border text-sm rounded mb-3"
            />
            <textarea
              placeholder="Short Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            ></textarea>

            <h3 className="mb-2">Assign Portfolio Manager</h3>
            <select
              value={portfolioManager}
              onChange={(e) => setPortfolioManager(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="">Add Manager</option>
              {availableManagers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} {user.lastname}
                </option>
              ))}
            </select>

            <div className="flex flex-col gap-2">
              <h3>Choose Incubatees</h3>
              {incubateeDropdowns.map((dropdown) => (
                <div key={dropdown.id} className="flex items-center gap-2">
                  {/* Dropdown to select incubatee */}
                  <select
                    value={dropdown.value}
                    onChange={(e) => handleDropdownChange(dropdown.id, e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Incubatee</option>
                    {availableAdditionalMembers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} {user.lastname}
                      </option>
                    ))}
                  </select>

                  {/* Dropdown to set role */}
                  <select
                    value={dropdown.role || ""}
                    onChange={(e) => handleRoleChange(dropdown.id, e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Role</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="System Analyst">System Analyst</option>
                    <option value="Developer">Developer</option>
                  </select>

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemoveDropdown(dropdown.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove"
                  >
                    <FaMinus />
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddDropdown}
                className="text-primary-color hover:text-primary-color-dark flex items-center gap-1"
                title="Add Incubatee"
              >
                <FaPlus />
                Add Incubatee
              </button>
            </div>

            {error && <p className="text-red-500 text-center mb-4 mt-2">{error}</p>}
            {validationError && <p className="text-red-500 text-center mb-4 mt-2">{validationError}</p>}

            <div className="flex justify-between mt-4">
              <button
                onClick={() => setIsPopupOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                className="px-4 py-2 bg-primary-color text-white rounded-lg hover:bg-opacity-80 transition"
              >
                Create Startup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdGroups;