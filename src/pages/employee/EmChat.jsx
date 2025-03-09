import { useEffect } from "react";
import EmployeeSidebar from "../../components/EmployeeSidebar.jsx";

function EmChat() {
  useEffect(() => {
    document.title = "Employee | Chats"; // Set the page title
}, []);

  return (
    <div className="flex">
        <EmployeeSidebar />
        <div className="flex flex-col items-center justify-center h-screen w-full">
            <h1 className="text-4xl font-bold">Employee Chat</h1>
        </div>
    </div>
  );
}

export default EmChat