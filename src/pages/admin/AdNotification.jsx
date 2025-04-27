import React, { useEffect, useState, useRef } from "react";
import AdminSidebar from "../../components/sidebar/AdminSidebar.jsx";
import { FaCheckCircle, FaBell, FaUserCheck } from "react-icons/fa"; // Import icons
import { HiDotsVertical } from "react-icons/hi"; // Import vertical dots icon
import { LiaHandsHelpingSolid } from "react-icons/lia";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db, auth } from "../../config/marian-config.js"; // Adjust the import based on your project structure
import { useNavigate } from "react-router-dom";

// Define the getIconForType function
const getIconForType = (type, sizeClass = "text-xl") => {
  switch (type) {
    case "group_request":
      return <LiaHandsHelpingSolid className={`text-red-500 ${sizeClass}`} />;
    case "group_completion":
      return <FaCheckCircle className={`text-green-500 ${sizeClass}`} />;
    default:
      return <FaBell className={`text-gray-500 ${sizeClass}`} />;
  }
};

function AdNotification() {
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null); // Track which dropdown is open
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = () => {
      const user = auth.currentUser;
      if (user) {
        const q = query(
          collection(db, "notifications"),
          where("userId", "==", user.uid) // Fetch notifications for the current admin user
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const notificationsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          // Sort notifications by timestamp in descending order
          notificationsData.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
          setNotifications(notificationsData);
        });

        return unsubscribe;
      }
    };

    const unsubscribe = fetchNotifications();
    return () => unsubscribe && unsubscribe();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, "notifications", notificationId), { read: true });
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleViewNotification = async (notificationId, groupId) => {
    try {
      await handleMarkAsRead(notificationId);

      // Check if groupId exists before navigating
      if (groupId) {
        navigate(`/admin/view-group/${groupId}`);
      } else {
        console.error("Group ID is missing in the notification.");
        alert("This notification does not have a valid group associated with it.");
      }
    } catch (error) {
      console.error("Error handling notification view:", error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteDoc(doc(db, "notifications", notificationId));
      setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const batch = writeBatch(db);
      notifications.forEach((notification) => {
        const notificationRef = doc(db, "notifications", notification.id);
        batch.update(notificationRef, { read: true });
      });
      await batch.commit();
      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          read: true,
        }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleDeleteAllNotifications = async () => {
    try {
      const batch = writeBatch(db);
      notifications.forEach((notification) => {
        const notificationRef = doc(db, "notifications", notification.id);
        batch.delete(notificationRef);
      });
      await batch.commit();
      setNotifications([]);
    } catch (error) {
      console.error("Error deleting all notifications:", error);
    }
  };

  const toggleDropdown = (id) => {
    setDropdownOpen((prev) => (prev === id ? null : id));
  };

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

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex flex-col items-start justify-start h-screen w-full p-10 overflow-y-auto">
        <div className="flex justify-between items-center w-full mb-4">
          <h1 className="text-4xl font-bold">Notifications</h1>
          <div className="flex gap-2">
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition"
            >
              Mark All as Read
            </button>
            <button
              onClick={handleDeleteAllNotifications}
              className="px-4 py-2 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
            >
              Delete All
            </button>
          </div>
        </div>
        <ul className="w-full">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <li
                key={notification.id}
                className={`p-4 shadow-md hover:shadow-lg transition duration-200 relative flex gap-4 items-center ${
                  notification.read ? "bg-gray-200" : "bg-white"
                }`}
              >
                {/* Display icon based on type */}
                <div className="flex-shrink-0">
                  {getIconForType(notification.type, "text-3xl")}
                </div>
                <div
                  onClick={() => handleViewNotification(notification.id, notification.groupId)}
                  className="flex-1 cursor-pointer"
                >
                  <p
                    className="text-sm mb-1"
                    dangerouslySetInnerHTML={{ __html: notification.message }}
                  ></p>
                  <p className="text-xs text-gray-500">
                    {notification.timestamp
                      ? new Date(notification.timestamp.seconds * 1000).toLocaleString("en-US", {
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
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown(notification.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <HiDotsVertical />
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
            ))
          ) : (
            <p className="text-gray-500">No notifications available.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

export default AdNotification;