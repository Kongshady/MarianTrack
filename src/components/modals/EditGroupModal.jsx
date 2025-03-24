import React from 'react';
import { FaRegTrashCan } from "react-icons/fa6";
import { IoArchiveOutline } from "react-icons/io5"; // Import the archive icon
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../config/marian-config.js";

const EditGroupModal = ({
  isOpen,
  onClose,
  onDelete,
  groupName,
  setGroupName,
  description,
  setDescription,
  availableUsers,
  selectedUser,
  setSelectedUser,
  handleAddMember,
  handleRemoveMember,
  handleUpdateGroup,
  group,
  onArchive
}) => {
  if (!isOpen) return null;

  const handleArchiveGroup = async () => {
    try {
      await updateDoc(doc(db, "groups", group.id), { archived: true });
      alert("Group archived successfully!");
      onArchive(group.id); // Call the onArchive function passed as a prop
      onClose(); // Close the modal after archiving
    } catch (error) {
      console.error("Error archiving group:", error);
      alert("Error archiving group. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-center">Edit Incubatee</h2>
          <div className="flex justify-center gap-2">
            <button
              onClick={handleArchiveGroup}
              className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
              title="Archive Group"
            >
              <IoArchiveOutline />
            </button>
            <button
              onClick={onDelete}
              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              title="Delete Group"
            >
              <FaRegTrashCan />
            </button>
          </div>
        </div>

        <div className="mb-2">
          <label className="block text-sm">Group Name</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full p-2 border rounded text-sm"
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded text-sm"
          ></textarea>
        </div>
        <h3 className="text-lg font-bold">Members</h3>
        <div className="flex items-center mb-2 gap-2">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full p-2 border rounded text-sm"
          >
            <option value="">Select Available Members</option>
            {availableUsers.map(user => (
              <option key={user.id} value={user.id}>{user.name} {user.lastname}</option>
            ))}
          </select>
          <button
            onClick={handleAddMember}
            className="bg-primary-color text-white text-xs p-1 rounded-sm hover:bg-opacity-80 transition"
          >
            Add Member
          </button>
        </div>
        <table className="min-w-full bg-white text-center">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Members</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {group.members.map(member => (
              <tr key={member.id}>
                <td className="p-2 text-sm">{member.name} {member.lastname} - {member.role}</td>
                <td className="p-2">
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="bg-red-500 text-white p-1 px-2 rounded-sm text-sm hover:bg-red-600 transition"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={onClose}
            className="p-3 px-6 bg-gray-500 text-white text-sm rounded-sm hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateGroup}
            className="p-3 px-6 bg-primary-color text-white text-sm rounded-sm hover:bg-opacity-80 transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditGroupModal;