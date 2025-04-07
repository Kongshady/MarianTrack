import React, { useEffect, useState } from "react";
import { db, auth } from "../../config/marian-config.js";
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, deleteDoc } from "firebase/firestore";
import AdminSidebar from "../../components/sidebar/AdminSidebar.jsx";
import { BsThreeDotsVertical } from "react-icons/bs";

function AdNotification() {
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null); // Track which dropdown is open

  useEffect(() => {
    document.title = "Admin | Notifications"; // Set the page title

    const fetchNotifications = async () => {
      const user = auth.currentUser;
      if (user) {
        const q = query(
          collection(db, "notifications"),
          where("userId", "==", user.uid), // Fetch notifications for the logged-in user
          orderBy("timestamp", "desc") // Sort by newest first
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
      <AdminSidebar />
      <div className="flex flex-col items-start justify-start h-screen w-full p-10">
        <div className="flex items-center justify-between w-full mb-5">
          <h1 className="text-4xl font-bold">Admin Notifications</h1>
        </div>
        {notifications.length > 0 ? (
          <div className="w-full max-h-[70vh] overflow-y-auto border rounded">
            <ul className="w-full">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`p-2 border flex justify-between items-center relative ${
                    notification.read ? "bg-gray-200" : "bg-white"
                  }`}
                >
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

export default AdNotification;