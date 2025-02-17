import EmSideBar from "../../components/EmSidebar.jsx";

function EmNotification() {
  return (
    <div className="flex">
        <EmSideBar />
        <div className="flex flex-col items-center justify-center h-screen w-full">
            <h1 className="text-4xl font-bold">Notification</h1>
        </div>
    </div>
  );
}

export default EmNotification;