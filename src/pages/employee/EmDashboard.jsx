import { useEffect } from "react";
import EmployeeSidebar from "../../components/sidebar/EmployeeSidebar.jsx";

function EmDashboard(){
    useEffect(() => {
        document.title = "Employee | Dashboard"; // Set the page title
    }, []);

    return(
        <div className="flex">
        <EmployeeSidebar />
        <div className="flex flex-col items-center justify-center h-screen w-full">
            <h1 className="text-4xl font-bold">Employee Dashboard</h1>
        </div>
    </div>
    );
}

export default EmDashboard