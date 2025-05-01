import { useEffect, useRef } from "react";
import { FaCheck } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { db } from "../../config/marian-config.js"; // Firestore connection
import { addDoc, collection, serverTimestamp, query, where, getDocs, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";

function PendingUsersTable({ pendingUsers, filterUsersByRole, handleApproval, setUserToReject, setIsRejectModalOpen }) {
    const previousPendingUsersRef = useRef([]); // To track the previous state of pending users

    // Sort users alphabetically by name
    const sortedUsers = filterUsersByRole(pendingUsers).sort((a, b) => {
        const nameA = `${a.name} ${a.lastname}`.toLowerCase();
        const nameB = `${b.name} ${b.lastname}`.toLowerCase();
        return nameA.localeCompare(nameB);
    });

    // Notification logic for new pending users
    useEffect(() => {
        const previousPendingUsers = previousPendingUsersRef.current;

        // Only proceed if there are new users
        if (pendingUsers.length > previousPendingUsers.length) {
            // Find the new users
            const newUsers = pendingUsers.filter(
                (user) => !previousPendingUsers.some((prevUser) => prevUser.id === user.id)
            );

            if (newUsers.length > 0) {
                // Notify TBI Manager and TBI Assistant
                const notifyAdmins = async () => {
                    try {
                        // Check the last notification timestamp
                        const notificationDocRef = doc(db, "notifications_meta", "last_pending_notification");
                        const notificationDoc = await getDoc(notificationDocRef);
                        const now = new Date();
                        const twentyMinutesAgo = new Date(now.getTime() - 20 * 60 * 1000);

                        if (!notificationDoc.exists() || notificationDoc.data().timestamp.toDate() < twentyMinutesAgo) {
                            // Update the last notification timestamp
                            await setDoc(notificationDocRef, { timestamp: serverTimestamp() });

                            const adminQuery = query(
                                collection(db, "users"),
                                where("role", "in", ["TBI Manager", "TBI Assistant"]) // Query for TBI Manager and Assistant roles
                            );
                            const adminSnapshot = await getDocs(adminQuery);

                            if (!adminSnapshot.empty) {
                                const adminUsers = adminSnapshot.docs.map((doc) => ({
                                    id: doc.id,
                                    ...doc.data(),
                                }));

                                // Create notifications for each admin
                                const notificationMessage = `<b>New Users:</b> There are new pending users awaiting for their approval.`;
                                adminUsers.forEach(async (admin) => {
                                    try {
                                        await addDoc(collection(db, "notifications"), {
                                            userId: admin.id, // Send notification to the admin
                                            message: notificationMessage,
                                            timestamp: serverTimestamp(),
                                            read: false,
                                            type: "new_pending_user", // Notification type for filtering if needed
                                        });
                                    } catch (error) {
                                        console.error("Error creating notification:", error);
                                    }
                                });
                            }
                        }
                    } catch (error) {
                        console.error("Error fetching admin users or creating notifications:", error);
                    }
                };

                notifyAdmins();
            }
        }

        // Update the reference to the current pending users
        previousPendingUsersRef.current = pendingUsers;
    }, [pendingUsers]);

    // Remove notification when a user is accepted
    const handleUserApproval = async (userId) => {
        try {
            // Call the provided approval handler
            await handleApproval(userId, "approved");

            // Remove the notification for the accepted user
            const notificationsQuery = query(
                collection(db, "notifications"),
                where("type", "==", "new_pending_user"),
                where("userId", "==", userId)
            );
            const notificationsSnapshot = await getDocs(notificationsQuery);

            notificationsSnapshot.forEach(async (docSnapshot) => {
                try {
                    await deleteDoc(doc(db, "notifications", docSnapshot.id));
                    console.log(`Notification for user ${userId} removed.`);
                } catch (error) {
                    console.error("Error removing notification:", error);
                }
            });
        } catch (error) {
            console.error("Error approving user:", error);
        }
    };

    return (
        <div>
            <h2 className="text-1xl font-semibold mb-3">Pending Users</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white text-xs">
                    <thead>
                        <tr className="bg-primary-color text-white text-xs">
                            <th className="p-2">Name</th>
                            <th className="p-2">Email</th>
                            <th className="p-2">Role</th>
                            <th className="p-2">Time Registered</th>
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedUsers.map((user, index) => (
                            <tr key={user.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                                <td className="p-2">{user.name} {user.lastname}</td>
                                <td className="p-2">{user.email}</td>
                                <td className="p-2">{user.role}</td>
                                <td className="p-2">{user.timestamp}</td>
                                <td className="p-2">
                                    <button
                                        className="bg-green-500 text-white px-3 py-1 rounded-sm mr-2 hover:bg-green-600"
                                        title="Approve"
                                        onClick={() => handleUserApproval(user.id)}
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