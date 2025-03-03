import { useState, useEffect } from "react";
import { db } from "../../config/marian-config.js"; // Firestore connection
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import AdminSidebar from "../../components/AdminSidebar.jsx";

function AdminAccountApproval() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        // Fetch users with 'pending' status
        const fetchUsers = async () => {
            const querySnapshot = await getDocs(collection(db, "users"));
            const pendingUsers = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data(), timestamp: doc.data().timestamp?.toDate().toLocaleString() || "N/A" }))
                .filter(user => user.status === "pending");
            setUsers(pendingUsers);
        };
        fetchUsers();
    }, []);

    const handleApproval = async (userId, status) => {
        await updateDoc(doc(db, "users", userId), { status });
        setUsers(users.filter(user => user.id !== userId)); // Remove from list
    };

    return (
        <div className="flex">
            <AdminSidebar />
            <div className="w-full p-10">
                <h1 className="text-4xl font-bold mb-5">Admin Account Approval</h1>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border rounded-lg">
                        <thead>
                            <tr className="bg-gray-200 text-gray-700">
                                <th className="p-3 border">Name</th>
                                <th className="p-3 border">Email</th>
                                <th className="p-3 border">Role</th>
                                <th className="p-3 border">Time Registered</th>
                                <th className="p-3 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="text-center border">
                                    <td className="p-3 border">{user.name} {user.lastname}</td>
                                    <td className="p-3 border">{user.email}</td>
                                    <td className="p-3 border">{user.role}</td>
                                    <td className="p-3 border">{user.timestamp}</td>
                                    <td className="p-3 border">
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
        </div>
    );
}

export default AdminAccountApproval;
