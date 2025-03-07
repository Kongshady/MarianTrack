import { useState, useEffect } from "react";
import { db, storage } from "../../config/marian-config.js";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AdminSidebar from "../../components/AdminSidebar.jsx";

function AdGroups() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [portfolioManager, setPortfolioManager] = useState("");
  const [projectManager, setProjectManager] = useState("");
  const [systemAnalyst, setSystemAnalyst] = useState("");
  const [developer, setDeveloper] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [availableManagers, setAvailableManagers] = useState([]);
  const [availableProjectManagers, setAvailableProjectManagers] = useState([]);
  const [availableSystemAnalysts, setAvailableSystemAnalysts] = useState([]);
  const [availableDevelopers, setAvailableDevelopers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsersAndGroups = async () => {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const groupsSnapshot = await getDocs(collection(db, "groups"));

      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const groups = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const assignedUserIds = new Set();
      groups.forEach(group => {
        group.members.forEach(member => assignedUserIds.add(member));
      });

      const availableUsers = users.filter(user => user.status === "approved");

      setAvailableManagers(availableUsers.filter(user => user.role === "Portfolio Manager"));
      setAvailableProjectManagers(availableUsers.filter(user => user.role === "Project Manager" && !assignedUserIds.has(user.id)));
      setAvailableSystemAnalysts(availableUsers.filter(user => user.role === "System Analyst" && !assignedUserIds.has(user.id)));
      setAvailableDevelopers(availableUsers.filter(user => user.role === "Developer" && !assignedUserIds.has(user.id)));
      setGroups(groups);
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
    setError(""); // Clear any previous errors

    let uploadedImageUrl = "";
    
    if (image) {
      const imageRef = ref(storage, `groupImages/${image.name}`);
      await uploadBytes(imageRef, image);
      uploadedImageUrl = await getDownloadURL(imageRef);
      setImageUrl(uploadedImageUrl);
    }
    
    await addDoc(collection(db, "groups"), {
      name: groupName,
      description,
      imageUrl: uploadedImageUrl,
      portfolioManager,
      members: [projectManager, systemAnalyst, developer],
      createdAt: serverTimestamp()
    });
    
    setGroupName("");
    setDescription("");
    setImage(null);
    setPortfolioManager("");
    setProjectManager("");
    setSystemAnalyst("");
    setDeveloper("");
    setIsPopupOpen(false);

    // Fetch the updated list of groups
    const querySnapshot = await getDocs(collection(db, "groups"));
    const groupsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setGroups(groupsData);
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex flex-col items-center justify-center h-screen w-full overflow-x-auto">
        <h1 className="text-4xl font-bold mb-5">Admin Groups</h1>
        <button
          onClick={() => setIsPopupOpen(true)}
          className="bg-primary-color text-white px-5 py-3 rounded-lg hover:bg-opacity-80 transition-all"
        >
          Create Group
        </button>

        {/* Displays The Created Groups */}
        <div className="mt-5 w-full px-10">
          {groups.map(group => (
            <div key={group.id} className="bg-white p-4 rounded-lg shadow mb-4 flex items-center justify-between">
              <div className="flex items-center">
                {group.imageUrl && <img src={group.imageUrl} alt={group.name} className="w-20 h-20 object-cover rounded-lg mr-4" />}
                <h2 className="text-2xl font-bold">{group.name}</h2>
              </div>
              <button className="bg-primary-color text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition">View</button>
            </div>
          ))}
        </div>
      </div>

      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg transform scale-95 transition-all animate-fade-in w-[500px]">
            <h2 className="text-xl font-bold mb-4 text-center">Create a Group</h2>
            
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            
            <label className="block mb-3 cursor-pointer text-center border border-gray-400 p-3 rounded-lg">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              {image ? "Image Selected" : "Click to upload Image"}
            </label>
            
            <input type="text" placeholder="Group Name" value={groupName} onChange={(e) => setGroupName(e.target.value)} className="w-full p-2 border rounded mb-3" />
            <textarea placeholder="Short Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border rounded mb-4"></textarea>
            
            <h3 className="mb-1">Assign Portfolio Manager</h3>
            <select value={portfolioManager} onChange={(e) => setPortfolioManager(e.target.value)} className="w-full p-2 border rounded mb-4">
              <option value="">Add Manager</option>
              {availableManagers.map(user => (
                <option key={user.id} value={user.id}>{user.name} {user.lastname}</option>
              ))}
            </select>
            
            <h3 className="mb-1">Add Members</h3>
            <select value={projectManager} onChange={(e) => setProjectManager(e.target.value)} className="w-full p-2 border rounded mb-2">
              <option value="">Add Project Manager</option>
              {availableProjectManagers.map(user => (
                <option key={user.id} value={user.id}>{user.name} {user.lastname}</option>
              ))}
            </select>
            <select value={systemAnalyst} onChange={(e) => setSystemAnalyst(e.target.value)} className="w-full p-2 border rounded mb-2">
              <option value="">Add System Analyst</option>
              {availableSystemAnalysts.map(user => (
                <option key={user.id} value={user.id}>{user.name} {user.lastname}</option>
              ))}
            </select>
            <select value={developer} onChange={(e) => setDeveloper(e.target.value)} className="w-full p-2 border rounded mb-4">
              <option value="">Add Developer</option>
              {availableDevelopers.map(user => (
                <option key={user.id} value={user.id}>{user.name} {user.lastname}</option>
              ))}
            </select>
            
            <div className="flex justify-between mt-4">
              <button onClick={() => setIsPopupOpen(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">Cancel</button>
              <button onClick={handleCreateGroup} className="px-4 py-2 bg-primary-color text-white rounded-lg hover:bg-opacity-80 transition">Create Group</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdGroups;