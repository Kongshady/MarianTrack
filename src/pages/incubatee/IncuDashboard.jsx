import { useEffect } from "react";
import IncubateeSidebar from "../../components/IncubateeSidebar.jsx";

function IncuDashboard() {
    useEffect(() => {
        document.title = "Incubatee | Dashboard"; // Set the page title
    }, []);

    return (
        <div className="flex">
            <IncubateeSidebar />
            <div className="flex flex-col items-center justify-center h-screen w-full">
                <h1 className="text-4xl font-bold">Dashboard</h1>
            </div>
        </div>
    );
}

export default IncuDashboard