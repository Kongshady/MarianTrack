import { useEffect } from "react";
import AdminSidebar from "../../components/sidebar/AdminSidebar.jsx";

function AdEditProfile() {
  useEffect(() => {
    document.title = "Admin | Chats"; // Set the page title
  }, []);

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex flex-col items-center justify-center h-screen w-full">
        <h1 className="text-4xl font-bold">Admin Edit Profile</h1>
      </div>
    </div>
  );
}

export default AdEditProfile