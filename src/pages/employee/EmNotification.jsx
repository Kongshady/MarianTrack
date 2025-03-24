import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../config/marian-config.js";
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc, writeBatch } from "firebase/firestore";
import EmployeeSidebar from "../../components/sidebar/EmployeeSidebar.jsx";
import { HiDotsVertical } from "react-icons/hi";

function EmNotification() {
  const [notifications, setNotifications] = useState([]);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
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
      alert("Notification deleted successfully!");
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert("Error deleting notification. Please try again.");
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
      alert("All notifications marked as read!");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      alert("Error marking all notifications as read. Please try again.");
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
      alert("All notifications deleted successfully!");
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      alert("Error deleting all notifications. Please try again.");
    }
  };

  const openDeleteAllModal = () => {
    setShowDeleteAllModal(true);
  };

  const closeDeleteAllModal = () => {
    setShowDeleteAllModal(false);
  };

  const confirmDeleteAllNotifications = () => {
    handleDeleteAllNotifications();
    closeDeleteAllModal();
  };

  return (
    <div className="flex">
      <EmployeeSidebar />
      <div className="flex flex-col items-start p-10 h-screen w-full">
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
              onClick={openDeleteAllModal}
              className="bg-red-500 text-white text-xs px-4 py-2 rounded-sm hover:bg-red-600 transition"
            >
              Delete All
            </button>
          </div>
        </div>
        <div className="w-full h-96 overflow-y-auto">
          <ul className="w-full">
            {notifications.map(notification => (
              <li key={notification.id} className={`p-2 border rounded-sm flex flex-row items-center justify-between ${notification.read ? 'bg-gray-200' : 'bg-white'} relative`}>
                <div>
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(notification.timestamp.seconds * 1000).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}, {new Date(notification.timestamp.seconds * 1000).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true
                    })}
                  </p>
                </div>
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

      {showDeleteAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-4">Are you sure you want to delete all notifications?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={closeDeleteAllModal}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAllNotifications}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmNotification;