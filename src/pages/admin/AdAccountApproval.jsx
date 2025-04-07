import { useState, useEffect } from "react";
import { db } from "../../config/marian-config.js"; // Firestore connection
import { collection, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import AdminSidebar from "../../components/sidebar/AdminSidebar.jsx";
import { formatDistanceToNow } from "date-fns"; // For formatting time
import { FaRegTrashCan } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa";
import { ImCross } from "react-icons/im";

function AdminAccountApproval() {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [approvedUsers, setApprovedUsers] = useState([]);
    const [activeTab, setActiveTab] = useState("pending");
    const [selectedRole, setSelectedRole] = useState("All");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [userToRemove, setUserToRemove] = useState(null);
    const [userToReject, setUserToReject] = useState(null);
    const [removalReason, setRemovalReason] = useState("");
    const [rejectReason, setRejectReason] = useState("");
    const [otherReason, setOtherReason] = useState("");
    const [otherRejectReason, setOtherRejectReason] = useState("");

    useEffect(() => {
        document.title = "Admin | Account Approval"; // Set the page title
    }, []);

    useEffect(() => {
        // Listen for real-time updates to the users collection
        const unsubscribeUsers = onSnapshot(collection(db, "users"), (querySnapshot) => {
            const users = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate().toLocaleString("en-US", {
                    month: "long",
                    day: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                }) || "N/A"
            }));

            setPendingUsers(users.filter(user => user.status === "pending"));
            setApprovedUsers(users.filter(user => user.status === "approved"));
        });

        return () => unsubscribeUsers();
    }, []);

    useEffect(() => {
        // Listen for real-time updates to the groups collection
        const unsubscribeGroups = onSnapshot(collection(db, "groups"), (groupsSnapshot) => {
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
        });

        return () => unsubscribeGroups();
    }, [approvedUsers]);

    const handleApproval = async (userId, status) => {
        await updateDoc(doc(db, "users", userId), { status });
        setPendingUsers(pendingUsers.filter(user => user.id !== userId));
        if (status === "approved") {
            const approvedUser = pendingUsers.find(user => user.id === userId);
            setApprovedUsers([...approvedUsers, { ...approvedUser, status: "approved" }]);
        }
    };

    const handleRemoveUser = async () => {
        if (userToRemove) {
            await deleteDoc(doc(db, "users", userToRemove.id));
            setApprovedUsers(approvedUsers.filter(user => user.id !== userToRemove.id));
            setIsModalOpen(false);
            setUserToRemove(null);
            setRemovalReason(""); // Reset the removal reason
            setOtherReason(""); // Reset the other reason
        }
    };

    const handleRejectUser = async () => {
        if (userToReject) {
            await deleteDoc(doc(db, "users", userToReject.id));
            setPendingUsers(pendingUsers.filter(user => user.id !== userToReject.id));
            setIsRejectModalOpen(false);
            setUserToReject(null);
            setRejectReason(""); // Reset the reject reason
            setOtherRejectReason(""); // Reset the other reject reason
        }
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
            <div className="w-full p-10 h-screen">
                <h1 className="text-3xl font-bold mb-5">User Management</h1>

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
                                        <tr key={user.id} className="text-center border text-xs">
                                            <td className="p-2 border">{user.name} {user.lastname}</td>
                                            <td className="p-2 border">{user.email}</td>
                                            <td className="p-2 border">{user.role}</td>
                                            <td className="p-2 border">{user.timestamp}</td>
                                            <td className="p-2 border">
                                                <button
                                                    className="bg-green-500 text-white px-3 py-1 rounded-sm mr-2 hover:bg-green-600"
                                                    title="Approve"
                                                    onClick={() => handleApproval(user.id, "approved")}
                                                >
                                                    <FaCheck />
                                                </button>
                                                <button
                                                    className="bg-red-500 text-white px-3 py-1 rounded-sm hover:bg-red-600"
                                                    title="Reject"
                                                    onClick={() => {
                                                        setUserToReject(user);
                                                        setIsRejectModalOpen(true);
                                                    }}
                                                >
                                                    <ImCross />
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
                                        <th className="p-2 border">Group</th>
                                        <th className="p-2 border">Last Online</th> {/* New Column */}
                                        <th className="p-2 border">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filterUsersByRole(approvedUsers).map(user => (
                                        <tr key={user.id} className="text-center border text-xs">
                                            <td className="text-left p-2">{user.name} {user.lastname}</td>
                                            <td className="p-2">{user.email}</td>
                                            <td className="p-2">{user.role}</td>
                                            <td className="p-2">{user.timestamp}</td>
                                            <td className="p-2">{user.groupName}</td>
                                            <td className="p-2">
                                                {user.lastOnline
                                                    ? `${formatDistanceToNow(new Date(user.lastOnline.seconds * 1000), { addSuffix: true })}`
                                                    : "N/A"}
                                            </td>
                                            <td className="p-2 flex justify-center">
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
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
                        <h2 className="text-xl font-bold mb-4 text-center">Confirm Removal</h2>
                        <p className="mb-4 text-center">Are you sure you want to remove {userToRemove?.name} {userToRemove?.lastname}?</p>
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium">Reason for removal:</label>
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="removalReason"
                                        value="Inappropriate behavior"
                                        checked={removalReason === "Inappropriate behavior"}
                                        onChange={(e) => setRemovalReason(e.target.value)}
                                        className="mr-2"
                                    />
                                    Inappropriate behavior
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="removalReason"
                                        value="Violation of terms"
                                        checked={removalReason === "Violation of terms"}
                                        onChange={(e) => setRemovalReason(e.target.value)}
                                        className="mr-2"
                                    />
                                    Violation of terms
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="removalReason"
                                        value="Other"
                                        checked={removalReason === "Other"}
                                        onChange={(e) => setRemovalReason(e.target.value)}
                                        className="mr-2"
                                    />
                                    Other
                                </label>
                                {removalReason === "Other" && (
                                    <input
                                        type="text"
                                        placeholder="Please specify"
                                        value={otherReason}
                                        onChange={(e) => setOtherReason(e.target.value)}
                                        className="mt-2 p-2 border rounded-sm text-sm"
                                    />
                                )}
                            </div>
                        </div>
                        <div className="flex justify-center gap-2">
                            <button
                                className="px-4 py-2 bg-gray-500 text-white text-sm rounded-sm hover:bg-gray-600 transition"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-500 text-white text-sm rounded-sm hover:bg-red-600 transition"
                                onClick={handleRemoveUser}
                                disabled={!removalReason || (removalReason === "Other" && !otherReason)} // Disable the button if no reason is selected or if "Other" is selected but not specified
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isRejectModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
                        <h2 className="text-xl font-bold mb-4 text-center">Confirm Rejection</h2>
                        <p className="mb-4 text-center">Are you sure you want to reject {userToReject?.name} {userToReject?.lastname}?</p>
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium">Reason for rejection:</label>
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="rejectReason"
                                        value="Incomplete information"
                                        checked={rejectReason === "Incomplete information"}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        className="mr-2"
                                    />
                                    Incomplete information
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="rejectReason"
                                        value="Not qualified"
                                        checked={rejectReason === "Not qualified"}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        className="mr-2"
                                    />
                                    Not qualified
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="rejectReason"
                                        value="Other"
                                        checked={rejectReason === "Other"}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        className="mr-2"
                                    />
                                    Other
                                </label>
                                {rejectReason === "Other" && (
                                    <input
                                        type="text"
                                        placeholder="Please specify"
                                        value={otherRejectReason}
                                        onChange={(e) => setOtherRejectReason(e.target.value)}
                                        className="p-2 border rounded-sm text-sm"
                                    />
                                )}
                            </div>
                        </div>
                        <div className="flex justify-center gap-2">
                            <button
                                className="px-4 py-2 bg-gray-500 text-white text-sm rounded-sm hover:bg-gray-600 transition"
                                onClick={() => setIsRejectModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-500 text-white text-sm rounded-sm hover:bg-red-600 transition"
                                onClick={handleRejectUser}
                                disabled={!rejectReason || (rejectReason === "Other" && !otherRejectReason)} // Disable the button if no reason is selected or if "Other" is selected but not specified
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminAccountApproval;