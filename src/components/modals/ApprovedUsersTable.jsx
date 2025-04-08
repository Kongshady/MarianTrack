import { FaRegTrashCan } from "react-icons/fa6";
import { FaInfoCircle } from "react-icons/fa";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns"; // Importing date-fns for date formatting
import { db } from "../../config/marian-config.js"; // Firestore connection
import { doc, getDoc } from "firebase/firestore";

function ApprovedUsersTable({ approvedUsers, setUserToRemove, setIsModalOpen }) {
    const [selectedUser, setSelectedUser] = useState(null); // State to store the selected user's information
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false); // State to control the information modal
    const [groupName, setGroupName] = useState(""); // State to store the group name

    const handleInfoClick = async (user) => {
        setSelectedUser(user); // Set the selected user's information
        setIsInfoModalOpen(true); // Open the information modal

        // Fetch the group name based on the groupId
        if (user.groupId) {
            try {
                const groupDoc = await getDoc(doc(db, "groups", user.groupId));
                if (groupDoc.exists()) {
                    setGroupName(groupDoc.data().name); // Set the group name
                } else {
                    setGroupName("N/A"); // If the group doesn't exist
                }
            } catch (error) {
                console.error("Error fetching group name:", error);
                setGroupName("N/A");
            }
        } else {
            setGroupName("N/A"); // If the user has no groupId
        }
    };

    return (
        <div>
            <h2 className="text-1xl font-semibold mb-3">Approved Users</h2>
            <div className="overflow-x-auto h-96">
                <table className="min-w-full bg-white border rounded-lg">
                    <thead className="sticky top-0">
                        <tr className="bg-primary-color text-white text-xs">
                            <th className="p-2 border">Name</th>
                            <th className="p-2 border">Email</th>
                            <th className="p-2 border">Role</th>
                            <th className="p-2 border">Time Registered</th>
                            <th className="p-2 border">Last Online</th>
                            <th className="p-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {approvedUsers.map((user) => (
                            <tr key={user.id} className="text-center border text-xs">
                                <td className="text-left p-2">{user.name} {user.lastname}</td>
                                <td className="p-2">{user.email}</td>
                                <td className="p-2">{user.role}</td>
                                <td className="p-2">{user.timestamp}</td>
                                <td className="p-2">
                                    {user.lastOnline
                                        ? `${formatDistanceToNow(new Date(user.lastOnline.seconds * 1000), { addSuffix: true })}`
                                        : "N/A"}
                                </td>
                                <td className="p-2 flex justify-center gap-2">
                                    <button
                                        className="bg-blue-500 text-white px-3 py-1 rounded-sm hover:bg-blue-600 flex items-center justify-center gap-1 text-center"
                                        onClick={() => handleInfoClick(user)}
                                    >
                                        <FaInfoCircle />
                                        Info
                                    </button>
                                    <button
                                        className="bg-red-500 text-white px-3 py-1 rounded-sm hover:bg-red-600 flex items-center justify-center gap-1 text-center"
                                        onClick={() => {
                                            setUserToRemove(user);
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        <FaRegTrashCan />
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Information Modal */}
            {isInfoModalOpen && selectedUser && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
                        <h2 className="text-xl font-bold mb-4 text-center">User Information</h2>
                        <div className="mb-4">
                            <p><strong>Name:</strong> {selectedUser.name} {selectedUser.lastname}</p>
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                            <p><strong>Group:</strong> {groupName}</p>
                            <p><strong>Mobile Number:</strong> {selectedUser.mobile || "N/A"}</p>
                            <p><strong>Facebook:</strong> {selectedUser.facebook ? (
                                <a href={selectedUser.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                    Facebook_Link
                                </a>
                            ) : "N/A"}</p>
                            <p><strong>GitHub:</strong> {selectedUser.github ? (
                                <a href={selectedUser.github} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                    Github_Link
                                </a>
                            ) : "N/A"}</p>
                            <p><strong>LinkedIn:</strong> {selectedUser.linkedin ? (
                                <a href={selectedUser.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                    LinkedIn_Link
                                </a>
                            ) : "N/A"}</p>
                        </div>
                        <div className="flex justify-center gap-2">
                            <button
                                className="px-4 py-2 bg-gray-500 text-white text-sm rounded-sm hover:bg-gray-600 transition"
                                onClick={() => setIsInfoModalOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ApprovedUsersTable;