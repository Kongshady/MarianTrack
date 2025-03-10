import { useState, useEffect } from "react";
import { db } from "../../config/marian-config.js"; // Firestore connection
import { collection, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import AdminSidebar from "../../components/AdminSidebar.jsx";
import { FaRegTrashCan } from "react-icons/fa6";

function AdminAccountApproval() {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [approvedUsers, setApprovedUsers] = useState([]);
    const [activeTab, setActiveTab] = useState("pending");
    const [selectedRole, setSelectedRole] = useState("All");

    useEffect(() => {
        document.title = "Admin | Account Approval"; // Set the page title
    }, []);

    useEffect(() => {
        // Fetch users with 'pending' and 'approved' status
        const fetchUsers = async () => {
            const querySnapshot = await getDocs(collection(db, "users"));
            const users = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate().toLocaleString() || "N/A"
            }));

            setPendingUsers(users.filter(user => user.status === "pending"));
            setApprovedUsers(users.filter(user => user.status === "approved"));
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        // Fetch group information for approved users
        const fetchGroups = async () => {
            const groupsSnapshot = await getDocs(collection(db, "groups"));
            const groups = groupsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setApprovedUsers(prevApprovedUsers =>
                prevApprovedUsers.map(user => {
                    const userGroup = groups.find(group => group.members.some(member => member.id === user.id));
                    return { ...user, groupName: userGroup ? userGroup.name : "No Group" };
                })
            );
        };
        fetchGroups();
    }, [approvedUsers]);

    const handleApproval = async (userId, status) => {
        await updateDoc(doc(db, "users", userId), { status });
        setPendingUsers(pendingUsers.filter(user => user.id !== userId));
        if (status === "approved") {
            const approvedUser = pendingUsers.find(user => user.id === userId);
            setApprovedUsers([...approvedUsers, { ...approvedUser, status: "approved" }]);
        }
    };

    const handleRemoveUser = async (userId) => {
        await deleteDoc(doc(db, "users", userId));
        setApprovedUsers(approvedUsers.filter(user => user.id !== userId));
    };

    const handleRoleChange = (e) => {
        setSelectedRole(e.target.value);
    };

    const filterUsersByRole = (users) => {
        if (selectedRole === "All") {
            return users;
        }
        return users.filter(user => user.role === selectedRole);
    };

    return (
        <div className="flex">
            <AdminSidebar />
            <div className="w-full p-10">
                <h1 className="text-3xl font-bold mb-5">Admin Account Approval</h1>

                {/* Tab Navigation */}
                <div className="flex mb-3 text-xs">
                    <button
                        className={`px-6 py-2 ${activeTab === "pending" ? "bg-primary-color text-white" : "bg-white text-primary-color border border-primary-color"}`}
                        onClick={() => setActiveTab("pending")}
                    >
                        Requests
                    </button>
                    <button
                        className={`px-6 py-2 ${activeTab === "approved" ? "bg-primary-color text-white" : "bg-white text-primary-color border border-primary-color"}`}
                        onClick={() => setActiveTab("approved")}
                    >
                        Approved Lists
                    </button>
                </div>

                {/* Role Filter Dropdown */}
                <div className="mb-3">
                    <label htmlFor="roleFilter" className="mr-2 text-sm">Filter by Role:</label>
                    <select id="roleFilter" value={selectedRole} onChange={handleRoleChange} className="p-2 border rounded-sm text-sm">
                        <option value="All">All</option>
                        <option value="TBI Manager">TBI Manager</option>
                        <option value="TBI Assistant">TBI Assistant</option>
                        <option value="Portfolio Manager">Portfolio Manager</option>
                        <option value="Project Manager">Project Manager</option>
                        <option value="System Analyst">System Analyst</option>
                        <option value="Developer">Developer</option>
                    </select>
                </div>

                {activeTab === "pending" && (
                    <div>
                        <h2 className="text-1xl font-semibold mb-3">Pending Users</h2>
                        <div className="overflow-x-auto mb-8">
                            <table className="min-w-full bg-white border rounded-lg">
                                <thead>
                                    <tr className="bg-primary-color text-white text-xs">
                                        <th className="p-2 border">Name</th>
                                        <th className="p-2 border">Email</th>
                                        <th className="p-2 border">Role</th>
                                        <th className="p-2 border">Time Registered</th>
                                        <th className="p-2 border">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filterUsersByRole(pendingUsers).map(user => (
                                        <tr key={user.id} className="text-center border">
                                            <td className="p-2 border">{user.name} {user.lastname}</td>
                                            <td className="p-2 border">{user.email}</td>
                                            <td className="p-2 border">{user.role}</td>
                                            <td className="p-2 border">{user.timestamp}</td>
                                            <td className="p-2 border">
                                                <button
                                                    className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                                                    onClick={() => handleApproval(user.id, "approved")}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                                    onClick={() => handleApproval(user.id, "rejected")}
                                                >
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "approved" && (
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
                                        <th className="p-2 border">In a Group?</th>
                                        <th className="p-2 border">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filterUsersByRole(approvedUsers).map(user => (
                                        <tr key={user.id} className="text-center border text-xs">
                                            <td className="p-2 border">{user.name} {user.lastname}</td>
                                            <td className="p-2 border">{user.email}</td>
                                            <td className="p-2 border">{user.role}</td>
                                            <td className="p-2 border">{user.timestamp}</td>
                                            <td className="p-2 border">{user.groupName}</td>
                                            <td className="p-2 border flex justify-center">
                                                <button
                                                    className="bg-red-500 text-white px-3 py-1 rounded-sm hover:bg-red-600 flex items-center justify-center gap-1 text-center"
                                                    onClick={() => handleRemoveUser(user.id)}
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
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminAccountApproval;