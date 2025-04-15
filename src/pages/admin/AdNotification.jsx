import React, { useEffect, useState } from "react";
import { db } from "../../config/marian-config";
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc, writeBatch } from "firebase/firestore";
import AdminSidebar from "../../components/sidebar/AdminSidebar.jsx";
import { FaCheckCircle, FaBell, FaUserCheck } from "react-icons/fa"; // Import icons

// Define the getIconForType function
const getIconForType = (type, sizeClass = "text-xl") => {
  switch (type) {
    case "group_request":
      return <FaUserCheck className={`text-blue-500 ${sizeClass}`} />;
    case "group_completion":
      return <FaCheckCircle className={`text-green-500 ${sizeClass}`} />;
    default:
      return <FaBell className={`text-gray-500 ${sizeClass}`} />;
  }
};

function AdNotification() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notificationsQuery = query(
          collection(db, "notifications"),
          where("type", "in", ["group_request", "group_completion"])
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
                className={`p-4 border rounded-sm flex items-start gap-4 ${
                  notification.read ? "bg-gray-200" : "bg-white"
                }`}
              >
                {/* Display icon based on type */}
                <div className="flex-shrink-0">
                  {getIconForType(notification.type, "text-3xl")} {/* Pass size class */}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1" dangerouslySetInnerHTML={{ __html: notification.message }}></p>
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