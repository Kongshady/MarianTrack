import React, { useEffect, useState } from "react";
import { db } from "../../config/marian-config";
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc, writeBatch } from "firebase/firestore";
import AdminSidebar from "../../components/sidebar/AdminSidebar.jsx";

function AdNotification() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Fetch only notifications of type "group_request" or "group_completion"
        const notificationsQuery = query(
          collection(db, "notifications"),
          where("type", "in", ["group_request", "group_completion"]) // Filter by type
        );

        const querySnapshot = await getDocs(notificationsQuery);
        const notificationsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(notificationsData);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
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
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      const batch = writeBatch(db);
      notifications.forEach((notif) => {
        const notifRef = doc(db, "notifications", notif.id);
        batch.delete(notifRef);
      });
      await batch.commit();
      setNotifications([]);
    } catch (error) {
      console.error("Error deleting all notifications:", error);
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex flex-col items-start justify-start h-screen w-full p-10 overflow-x-auto">
        <div className="flex justify-between items-center w-full mb-4">
          <h1 className="text-4xl font-bold">Notifications</h1>
          <div className="flex gap-2">
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition"
            >
              Mark All as Read
            </button>
            <button
              onClick={deleteAllNotifications}
              className="px-4 py-2 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
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
                className={`p-2 bg-white rounded-sm shadow-md hover:shadow-lg transition duration-200 relative ${
                  notification.read ? "bg-gray-200" : "bg-white"
                }`}
              >
                <p className="text-sm text-gray-700">{notification.message}</p>
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
                <div className="absolute top-4 right-4">
                  <button className="text-gray-500 hover:text-gray-700">&#x22EE;</button>
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

export default AdNotification;