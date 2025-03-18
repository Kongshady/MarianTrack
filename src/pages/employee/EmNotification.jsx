import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../config/marian-config.js";
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import EmployeeSidebar from "../../components/sidebar/EmployeeSidebar.jsx";
import { HiDotsVertical } from "react-icons/hi";

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
      alert("Notification deleted successfully!");
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert("Error deleting notification. Please try again.");
    }
  };

  return (
    <div className="flex">
      <EmployeeSidebar />
      <div className="flex flex-col items-start p-10 h-screen w-full">
        <h1 className="text-4xl font-bold mb-5">Notifications</h1>
        <div className="w-full h-96 overflow-y-auto">
          <ul className="w-full">
            {notifications.map(notification => (
              <li key={notification.id} className={`p-2 border rounded-sm flex flex-row items-center justify-between ${notification.read ? 'bg-gray-200' : 'bg-white'} relative`}>
                <p className="text-sm">{notification.message}</p>
                <div className="relative">
                  <button className="text-blue-500 hover:underline group p-2">
                    <HiDotsVertical />
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10 hidden group-hover:block">
                      <button
                        onClick={() => handleViewNotification(notification.id, notification.groupId)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        View
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