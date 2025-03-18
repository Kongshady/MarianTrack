import { useEffect } from "react";
import AdminSidebar from "../../components/sidebar/AdminSidebar.jsx";

function AdNotification() {
  useEffect(() => {
          document.title = "Admin | Notifications"; // Set the page title
      }, []);

  return (
    <div className="flex">
        <AdminSidebar />
        <div className="flex flex-col items-center justify-center h-screen w-full">
            <h1 className="text-4xl font-bold">Admin Notification</h1>
        </div>
    </div>
  );
}

export default AdNotification;