import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, storage } from "../../config/marian-config.js";
import { collection, addDoc, getDocs, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AdminSidebar from "../../components/sidebar/AdminSidebar.jsx";
import { IoAddOutline, IoArchiveOutline } from "react-icons/io5";
import { FaPlus } from "react-icons/fa";

function AdGroups() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [portfolioManager, setPortfolioManager] = useState("");
  const [projectManager, setProjectManager] = useState("");
  const [systemAnalyst, setSystemAnalyst] = useState("");
  const [developer, setDeveloper] = useState("");
  const [additionalMember, setAdditionalMember] = useState("");
  const [showAdditionalMemberInput, setShowAdditionalMemberInput] = useState(false);
  const [availableManagers, setAvailableManagers] = useState([]);
  const [availableProjectManagers, setAvailableProjectManagers] = useState([]);
  const [availableSystemAnalysts, setAvailableSystemAnalysts] = useState([]);
  const [availableDevelopers, setAvailableDevelopers] = useState([]);
  const [availableAdditionalMembers, setAvailableAdditionalMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Admin | Groups"; // Set the page title
  }, []);

  useEffect(() => {
    const fetchGroupsAndUsers = async () => {
      try {
        const groupsSnapshot = await getDocs(collection(db, "groups"));
        const groupsData = groupsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const activeGroups = groupsData.filter((group) => !group.archived);
        setGroups(activeGroups);
        setFilteredGroups(activeGroups);

        const usersSnapshot = await getDocs(collection(db, "users"));
        const users = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAvailableManagers(users.filter((user) => user.role === "Portfolio Manager"));
        setAvailableProjectManagers(users.filter((user) => user.role === "Project Manager"));
        setAvailableSystemAnalysts(users.filter((user) => user.role === "System Analyst"));
        setAvailableDevelopers(users.filter((user) => user.role === "Developer"));
        setAvailableAdditionalMembers(users.filter((user) => !["TBI Manager", "TBI Assistant", "Portfolio Manager"].includes(user.role)));
      } catch (error) {
        console.error("Error fetching groups and users:", error);
      }
    };

    fetchGroupsAndUsers();
  }, []);

  useEffect(() => {
    const filtered = groups.filter((group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredGroups(filtered);
  }, [searchTerm, groups]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

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
    setError(""); // Clear any previous errors

    let uploadedImageUrl = "";

    try {
      if (image) {
        const imageRef = ref(storage, `groupImages/${image.name}`);
        await uploadBytes(imageRef, image);
        uploadedImageUrl = await getDownloadURL(imageRef);
      }

      const groupDocRef = await addDoc(collection(db, "groups"), {
        name: groupName,
        description,
        imageUrl: uploadedImageUrl,
        portfolioManager,
        projectManager,
        systemAnalyst,
        developer,
        additionalMember,
        createdAt: serverTimestamp(),
      });

      setGroupName("");
      setDescription("");
      setImage(null);
      setPortfolioManager("");
      setProjectManager("");
      setSystemAnalyst("");
      setDeveloper("");
      setAdditionalMember("");
      setShowAdditionalMemberInput(false);
      setIsPopupOpen(false);

      const updatedGroups = await getDocs(collection(db, "groups"));
      setGroups(updatedGroups.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error creating group:", error);
      setError("An error occurred while creating the group. Please try again.");
    }
  };

  const handleNavigateToArchives = () => {
    navigate("/admin-groups/archives");
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex flex-col items-start h-screen w-full overflow-x-auto p-10">
        <div className="flex flex-row justify-between items-center w-full mb-5">
          <h1 className="text-4xl font-bold">Incubatees</h1>
          <div className="flex gap-2">
            {/* Search Bar */}
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search Groups"
              className="p-2 border rounded text-sm"
            />
            <button
              onClick={() => setIsPopupOpen(true)}
              className="bg-primary-color text-white p-2 rounded-sm text-sm hover:bg-opacity-80 transition-all flex items-center justify-center gap-1"
            >
              <IoAddOutline className="text-xl" />
              Create New Group
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

        {/* Displays The Created Groups */}
        <div className="mt-2 w-full overflow-y-auto">
          <div className="border-r-2 border-l-2">
            <ul>
              {filteredGroups.map((group, index) => (
                <div key={group.id} className="relative">
                  <Link to={`/admin/view-group/${group.id}`}>
                    <li
                      className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-100 transition ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      {/* Image Placeholder */}
                      <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                        {group.imageUrl ? (
                          <img
                            src={group.imageUrl}
                            alt={group.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-500 text-xs text-center">No Image</span>
                        )}
                      </div>

                      {/* Group Details */}
                      <div>
                        <h2 className="text-sm font-bold">{group.name}</h2>
                        <p className="text-xs">{group.description}</p>
                      </div>
                    </li>
                  </Link>
                </div>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Modal for Creating a New Group */}
      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-sm text-sm shadow-lg transform scale-95 transition-all animate-fade-in w-[500px]">
            <h2 className="text-xl font-bold mb-4 text-center">Create a Group</h2>
            <label className="block mb-3 cursor-pointer text-center border border-gray-400 p-3 rounded-sm">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              {image ? "Image Selected" : "Click to upload Image"}
            </label>

            <input
              type="text"
              placeholder="Group Name"
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

            <div className="flex items-center justify-between">
              <h3 className="">Add Members</h3>
              <button
                onClick={() => setShowAdditionalMemberInput(!showAdditionalMemberInput)}
                title="Add Additional Member"
                className="ml-2 text-primary-color p-1 hover:bg-opacity-80 transition"
              >
                <FaPlus />
              </button>
            </div>
            <select
              value={projectManager}
              onChange={(e) => setProjectManager(e.target.value)}
              className="w-full p-2 border rounded mt-2 mb-2"
            >
              <option value="">Add Project Manager</option>
              {availableProjectManagers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} {user.lastname}
                </option>
              ))}
            </select>
            <select
              value={systemAnalyst}
              onChange={(e) => setSystemAnalyst(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            >
              <option value="">Add System Analyst</option>
              {availableSystemAnalysts.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} {user.lastname}
                </option>
              ))}
            </select>
            <select
              value={developer}
              onChange={(e) => setDeveloper(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            >
              <option value="">Add Developer</option>
              {availableDevelopers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} {user.lastname}
                </option>
              ))}
            </select>

            {showAdditionalMemberInput && (
              <select
                value={additionalMember}
                onChange={(e) => setAdditionalMember(e.target.value)}
                className="w-full p-2 border rounded mb-2"
              >
                <option value="">Add Additional Member</option>
                {availableAdditionalMembers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} {user.lastname}
                  </option>
                ))}
              </select>
            )}

            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

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
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdGroups;