import React, { useEffect, useState } from "react";
import { db, auth } from "../../config/marian-config.js";
import { collection, query, where, onSnapshot, updateDoc, doc, deleteDoc, orderBy } from "firebase/firestore";
import { BsThreeDotsVertical } from "react-icons/bs"; // Import the three-dot icon
import { SiMoneygram } from "react-icons/si"; // Import the Moneygram icon
import IncubateeSidebar from "../../components/sidebar/IncubateeSidebar.jsx";

function IncuNotification() {
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null); // Track which dropdown is open

  useEffect(() => {
    const fetchNotifications = async () => {
      const user = auth.currentUser;
      if (user) {
        const q = query(
          collection(db, "notifications"),
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc") // Sort by timestamp in descending order
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          setNotifications(
            querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        });

        return () => unsubscribe();
      }
    };

    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const q = query(
          collection(db, "notifications"),
          where("userId", "==", user.uid),
          where("read", "==", false)
        );

        const querySnapshot = await onSnapshot(q, async (snapshot) => {
          const batch = snapshot.docs.map((doc) =>
            updateDoc(doc.ref, { read: true })
          );
          await Promise.all(batch);
        });
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const q = query(
          collection(db, "notifications"),
          where("userId", "==", user.uid)
        );

        const querySnapshot = await onSnapshot(q, async (snapshot) => {
          const batch = snapshot.docs.map((doc) => deleteDoc(doc.ref));
          await Promise.all(batch);
        });
      }
    } catch (error) {
      console.error("Error deleting all notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, { read: true });
  };

  const deleteNotification = async (notificationId) => {
    const notificationRef = doc(db, "notifications", notificationId);
    await deleteDoc(notificationRef);
  };

  return (
    <div className="flex">
      <IncubateeSidebar />
      <div className="flex flex-col items-start justify-start h-screen w-full p-10">
        <div className="flex items-center justify-between w-full mb-5">
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
          // Add a scrollable container for the notifications list
          <div className="w-full max-h-[90vh] overflow-y-auto border rounded">
            <ul className="w-full">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`p-2 border flex justify-between items-center relative ${
                    notification.read ? "bg-gray-200" : "bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <SiMoneygram size={40} className="text-red-500 border p-2 rounded-full bg-white" />
                    <div>
                      <p className="text-sm text-gray-700">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.timestamp.seconds * 1000).toLocaleString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setDropdownOpen((prev) => (prev === notification.id ? null : notification.id))
                      }
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <BsThreeDotsVertical />
                    </button>
                    {dropdownOpen === notification.id && (
                      <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-10">
                        <button
                          onClick={() => {
                            markAsRead(notification.id);
                            setDropdownOpen(null);
                          }}
                          className="block w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
                        >
                          Mark as Read
                        </button>
                        <button
                          onClick={() => {
                            deleteNotification(notification.id);
                            setDropdownOpen(null);
                          }}
                          className="block w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500">No new notifications.</p>
        )}
      </div>
    </div>
  );
}

export default IncuNotification;