import StSideBar from "../../components/StSidebar.jsx";

function StNotification() {
    return (
        <div className="flex">
            <StSideBar />
            <div className="flex flex-col items-center justify-center h-screen w-full">
                <h1 className="text-4xl font-bold">Notification</h1>
            </div>
        </div>
    );
}

export default StNotification