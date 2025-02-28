import IncubateeSidebar from "../../components/IncubateeSidebar.jsx";

function IncuNotification() {
    return (
        <div className="flex">
            <IncubateeSidebar />
            <div className="flex flex-col items-center justify-center h-screen w-full">
                <h1 className="text-4xl font-bold">Notification</h1>
            </div>
        </div>
    );
}

export default IncuNotification