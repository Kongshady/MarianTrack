import React, { useEffect, useState, useRef } from "react";
import { auth, db } from "../../config/marian-config";
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc, writeBatch } from "firebase/firestore";
import IncubateeSidebar from "../../components/sidebar/IncubateeSidebar.jsx";
import { FaUserCheck, FaBell } from "react-icons/fa"; // Import icons

function IncuNotification() {
    const [notifications, setNotifications] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(null); // Track which dropdown is open
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const notificationsQuery = query(
                        collection(db, "notifications"),
                        where("userId", "==", user.uid)
                    );

                    const querySnapshot = await getDocs(notificationsQuery);
                    const notificationsData = querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setNotifications(notificationsData);
                }
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        fetchNotifications();
    }, []);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(null); // Close the dropdown if clicked outside
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    const markAllAsRead = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                const unreadNotifications = notifications.filter((notif) => !notif.read);
                for (const notif of unreadNotifications) {
                    const notifRef = doc(db, "notifications", notif.id);
                    await updateDoc(notifRef, { read: true });
                }
                setNotifications((prev) =>
                    prev.map((notif) => ({
                        ...notif,
                        read: true,
                    }))
                );
            }
        } catch (error) {
            console.error("Error marking notifications as read:", error);
        }
    };

    const deleteAllNotifications = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                // Fetch all notifications for the current user
                const notificationsQuery = query(
                    collection(db, "notifications"),
                    where("userId", "==", user.uid)
                );

                const querySnapshot = await getDocs(notificationsQuery);

                // Delete each notification from Firestore
                const batch = writeBatch(db);
                querySnapshot.forEach((doc) => {
                    batch.delete(doc.ref);
                });

                await batch.commit(); // Commit the batch delete

                // Clear notifications from the state
                setNotifications([]);
            }
        } catch (error) {
            console.error("Error deleting all notifications:", error);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            const notifRef = doc(db, "notifications", id);
            await updateDoc(notifRef, { read: true });
            setNotifications((prev) =>
                prev.map((notif) =>
                    notif.id === id
                        ? {
                              ...notif,
                              read: true,
                          }
                        : notif
                )
            );
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const handleDeleteNotification = async (id) => {
        try {
            const notifRef = doc(db, "notifications", id);
            await deleteDoc(notifRef);
            setNotifications((prev) => prev.filter((notif) => notif.id !== id));
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    const toggleDropdown = (id) => {
        setDropdownOpen((prev) => (prev === id ? null : id));
    };

    const getIconForType = (type) => {
        switch (type) {
            case "welcome":
                return <FaUserCheck className="text-green-500" size={30} />;
            case "manager":
                return <FaBell className="text-blue-500" size={30} />;
            default:
                return <FaBell className="text-gray-500" size={30} />;
        }
    };

    return (
        <div className="flex">
            <IncubateeSidebar />
            <div className="flex flex-col items-start justify-start h-screen w-full p-10 overflow-y-auto">
                <div className="flex justify-between items-center w-full mb-4">
                    <h1 className="text-4xl font-bold">Notifications</h1>
                    <div className="flex gap-1">
                        <button
                            onClick={markAllAsRead}
                            className="px-4 py-2 bg-blue-500 text-white text-xs hover:bg-blue-600 transition"
                        >
                            Mark All as Read
                        </button>
                        <button
                            onClick={deleteAllNotifications}
                            className="px-4 py-2 bg-red-500 text-white text-xs hover:bg-red-600 transition"
                        >
                            Delete All
                        </button>
                    </div>
                </div>
                {notifications.length > 0 ? (
                    <ul className="w-full">
                        {notifications.map((notification) => (
                            <li
                                key={notification.id}
                                className={`p-4 shadow-md hover:shadow-lg transition duration-200 relative flex gap-4 items-center ${
                                    notification.read ? "bg-gray-200" : "bg-white"
                                }`}
                            >
                                {/* Display icon based on type */}
                                <div className="flex-shrink-0">
                                    {getIconForType(notification.type, "text-3xl")} {/* Pass size class */}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm mb-1" dangerouslySetInnerHTML={{ __html: notification.message }}></p>
                                    <p className="text-xs text-gray-500">
                                        {notification.createdAt
                                            ? new Date(notification.createdAt.toDate()).toLocaleString("en-US", {
                                                  year: "numeric",
                                                  month: "long",
                                                  day: "numeric",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                  hour12: true,
                                              })
                                            : "Unknown"}
                                    </p>
                                </div>
                                {/* Vertical Dots */}
                                <div className="absolute top-4 right-4">
                                    <button
                                        onClick={() => toggleDropdown(notification.id)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        &#x22EE;
                                    </button>
                                    {dropdownOpen === notification.id && (
                                        <div
                                            ref={dropdownRef}
                                            className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10"
                                        >
                                            <button
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Mark as Read
                                            </button>
                                            <button
                                                onClick={() => handleDeleteNotification(notification.id)}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No notifications available.</p>
                )}
            </div>
        </div>
    );
}

export default IncuNotification;