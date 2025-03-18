import { useEffect } from "react";
import EmployeeSidebar from "../../components/sidebar/EmployeeSidebar.jsx";

function EmProgress() {
  useEffect(() => {
    document.title = "Employee | Progress"; // Set the page title
  }, []);

  return (
    <div className="flex">
      <EmployeeSidebar />
      <div className="flex flex-col items-center justify-center h-screen w-full">
        <h1 className="text-4xl font-bold">Employee Progress</h1>
      </div>
    </div>
  );
}

export default EmProgress