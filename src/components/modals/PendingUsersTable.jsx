import { FaCheck } from "react-icons/fa";
import { ImCross } from "react-icons/im";

function PendingUsersTable({ pendingUsers, filterUsersByRole, handleApproval, setUserToReject, setIsRejectModalOpen }) {
    return (
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
                        {filterUsersByRole(pendingUsers).map((user) => (
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
    );
}

export default PendingUsersTable;