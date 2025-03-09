import { useEffect, useState } from "react";
import { db, auth } from "../../config/marian-config.js";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import EmployeeSidebar from "../../components/EmployeeSidebar.jsx";

function EmNotification() {
  const [notifications, setNotifications] = useState([]);

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

  return (
    <div className="flex">
      <EmployeeSidebar />
      <div className="flex flex-col items-start p-10 h-screen w-full">
        <h1 className="text-4xl font-bold mb-5">Employee Notification</h1>
        <ul className="w-full">
          {notifications.map(notification => (
            <li key={notification.id} className={`p-4 border rounded flex flex-row items-center justify-between ${notification.read ? 'bg-gray-200' : 'bg-white'}`}>
              <p>{notification.message}</p>
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="text-blue-500 hover:underline"
                >
                  Mark as read
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default EmNotification;