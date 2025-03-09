import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../config/marian-config.js";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, getDocs, collection, deleteDoc } from "firebase/firestore";
import AdminSidebar from "../../components/AdminSidebar.jsx";

function AdViewGroups() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [agreeToDelete, setAgreeToDelete] = useState(false);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const groupDoc = await getDoc(doc(db, "groups", groupId));
        if (groupDoc.exists()) {
          const groupData = groupDoc.data();
          setGroup({ id: groupDoc.id, ...groupData });
          setGroupName(groupData.name);
          setDescription(groupData.description);
        }
      } catch (error) {
        console.error("Error fetching group:", error);
      }
    };

    const fetchAvailableUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const groupsSnapshot = await getDocs(collection(db, "groups"));

        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const groups = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const assignedUserIds = new Set();
        groups.forEach(group => {
          if (group.members) {
            group.members.forEach(member => assignedUserIds.add(member.id));
          }
        });

        const availableUsers = users.filter(user => 
          user.status === "approved" && 
          !assignedUserIds.has(user.id) && 
          user.role !== "TBI Manager" && 
          user.role !== "Portfolio Manager"
        );
        setAvailableUsers(availableUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchGroup();
    fetchAvailableUsers();
  }, [groupId]);

  const handleAddMember = async () => {
    if (!selectedUser) return;

    try {
      const userDoc = await getDoc(doc(db, "users", selectedUser));
      const userData = { id: selectedUser, ...userDoc.data() };

      await updateDoc(doc(db, "groups", groupId), {
        members: arrayUnion(userData)
      });

      setGroup(prevGroup => ({
        ...prevGroup,
        members: [...prevGroup.members, userData]
      }));

      setSelectedUser("");
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const memberToRemove = group.members.find(member => member.id === memberId);

      await updateDoc(doc(db, "groups", groupId), {
        members: arrayRemove(memberToRemove)
      });

      setGroup(prevGroup => ({
        ...prevGroup,
        members: prevGroup.members.filter(member => member.id !== memberId)
      }));
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const handleUpdateGroup = async () => {
    try {
      await updateDoc(doc(db, "groups", groupId), {
        name: groupName,
        description,
        members: group.members
      });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating group:", error);
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await deleteDoc(doc(db, "groups", groupId));
      setIsDeleteModalOpen(false);
      navigate("/admin-groups");
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  if (!group) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex flex-col items-start h-screen w-full p-10">
        <div className="flex justify-between w-full">
          <h1 className="text-4xl font-bold mb-5">{group.name}</h1>
          <div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-primary-color text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition mr-2"
            >
              Edit Group
            </button>
          </div>
        </div>
        <p className="text-sm">{group.description}</p>
        {group.imageUrl && <img src={group.imageUrl} alt={group.name} className="mt-2 w-full h-40 object-cover rounded-lg" />}
        <div className="mt-2">
          <h3 className="font-bold text-sm">Members:</h3>
          <ul className="text-sm">
            {group.members.map(member => (
              <li key={member.id}>
                {member.name} {member.lastname}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[600px]">
            <h2 className="text-xl font-bold mb-4 text-center">Edit Group</h2>
            <div className="mb-4">
              <label className="block mb-1">Group Name</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded"
              ></textarea>
            </div>
            <h3 className="text-lg font-bold mb-2">Members</h3>
            <table className="min-w-full bg-white border border-gray-200 text-center">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Members</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {group.members.map(member => (
                  <tr key={member.id}>
                    <td className="py-2 px-4 border-b">{member.name} {member.lastname}</td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 px-4 border-b">
                    <select
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Select User</option>
                      {availableUsers.map(user => (
                        <option key={user.id} value={user.id}>{user.name} {user.lastname}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={handleAddMember}
                      className="bg-primary-color text-white px-2 py-1 rounded-lg hover:bg-opacity-80 transition"
                    >
                      Add Member
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateGroup}
                className="px-4 py-2 bg-primary-color text-white rounded-lg hover:bg-opacity-80 transition"
              >
                Confirm
              </button>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Delete Group
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
            <h2 className="text-xl font-bold mb-4 text-center">Delete Group</h2>
            <p className="mb-4 text-center">Are you sure you want to delete this group? This action cannot be undone.</p>
            <div className="mb-4 flex items-center justify-center">
              <input
                type="checkbox"
                id="agreeToDelete"
                checked={agreeToDelete}
                onChange={(e) => setAgreeToDelete(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="agreeToDelete">I agree</label>
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGroup}
                disabled={!agreeToDelete}
                className={`px-4 py-2 rounded-lg transition ${agreeToDelete ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdViewGroups;