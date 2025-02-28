import AdminSideBar from "../../components/AdminSidebar.jsx";

function AdDashboard(){
    return(
        <div className="flex">
        <AdminSideBar />
        <div className="flex flex-col items-center justify-center h-screen w-full">
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        </div>
    </div>
    );
}

export default AdDashboard