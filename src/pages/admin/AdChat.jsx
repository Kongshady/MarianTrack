import { useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar.jsx";

function AdChat() {
  useEffect(() => {
    document.title = "Admin | Chats"; // Set the page title
  }, []);

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex flex-col items-center justify-center h-screen w-full">
        <h1 className="text-4xl font-bold">Admin Chat</h1>
      </div>
    </div>
  );
}

export default AdChat