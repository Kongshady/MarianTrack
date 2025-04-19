import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../config/marian-config.js";
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc, writeBatch } from "firebase/firestore";
import EmployeeSidebar from "../../components/sidebar/EmployeeSidebar.jsx";
import { HiDotsVertical } from "react-icons/hi";
import { FaCheckCircle, FaBell, FaUserCheck } from "react-icons/fa"; // Import icons
import { LiaHandsHelpingSolid } from "react-icons/lia";

// Define the getIconForType function
const getIconForType = (type, sizeClass = "text-xl") => {
  switch (type) {
    case "manager":
      return <FaCheckCircle className={`text-green-500 ${sizeClass}`} />;
    case "welcome":
      return <FaUserCheck className={`text-blue-500 ${sizeClass}`} />;
    default:
      return <LiaHandsHelpingSolid className={`text-red-600 ${sizeClass}`} />;
  }
};

function EmNotification() {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Employee | Notification"; // Set the page title

    const fetchNotifications = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const q = query(collection(db, "notifications"), where("userId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          const notificationsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          // Sort notifications by timestamp in descending order
          notificationsData.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
          setNotifications(notificationsData);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, "notifications", notificationId), { read: true });
      setNotifications(notifications.map(notification =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleViewNotification = async (notificationId, groupId) => {
    await markAsRead(notificationId);
    navigate(`/employee/view-group/${groupId}`);
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteDoc(doc(db, "notifications", notificationId));
      setNotifications(notifications.filter(notification => notification.id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const batch = writeBatch(db);
      notifications.forEach(notification => {
        const notificationRef = doc(db, "notifications", notification.id);
        batch.update(notificationRef, { read: true });
      });
      await batch.commit();
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleDeleteAllNotifications = async () => {
    try {
      const batch = writeBatch(db);
      notifications.forEach(notification => {
        const notificationRef = doc(db, "notifications", notification.id);
        batch.delete(notificationRef);
      });
      await batch.commit();
      setNotifications([]);
    } catch (error) {
      console.error("Error deleting all notifications:", error);
    }
  };

  return (
    <div className="flex">
      <EmployeeSidebar />
      <div className="flex flex-col items-start p-10 h-screen w-full overflow-y-auto">
        <div className="flex items-center justify-between w-full mb-5">
          <h1 className="text-4xl font-bold">Notifications</h1>
          <div className="flex gap-1">
            <button
              onClick={handleMarkAllAsRead}
              className="bg-blue-500 text-white text-xs px-4 py-2 rounded-sm hover:bg-blue-600 transition"
            >
              Mark All as Read
            </button>
            <button
              onClick={handleDeleteAllNotifications}
              className="bg-red-500 text-white text-xs px-4 py-2 rounded-sm hover:bg-red-600 transition"
            >
              Delete All
            </button>
          </div>
        </div>
        <div className="w-full">
          <ul className="w-full">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`p-4 border rounded-sm flex items-center gap-4 ${
                  notification.read ? "bg-gray-200" : "bg-white"
                }`}
              >
                {/* Display icon based on type */}
                <div className="flex-shrink-0">
                  {getIconForType(notification.type, "text-3xl")} {/* Pass size class */}
                </div>
                {/* Make the entire notification clickable */}
                <div
                  onClick={() => handleViewNotification(notification.id, notification.groupId)}
                  className="flex-1 cursor-pointer"
                >
                  <p
                    className="text-sm mb-1"
                    dangerouslySetInnerHTML={{ __html: notification.message }}
                  ></p>
                  <p className="text-xs text-gray-500">
                    {new Date(notification.timestamp.seconds * 1000).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    ,{" "}
                    {new Date(notification.timestamp.seconds * 1000).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                    })}
                  </p>
                </div>
                {/* Vertical Dots */}
                <div className="relative">
                  <button className="text-blue-500 hover:underline group p-2">
                    <HiDotsVertical />
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10 hidden group-hover:block">
                      <button
                        onClick={() => markAsRead(notification.id)}
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
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default EmNotification;