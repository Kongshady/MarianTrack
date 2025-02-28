import EmployeeSidebar from "../../components/EmployeeSidebar.jsx";

function EmNotification() {
  return (
    <div className="flex">
        <EmployeeSidebar />
        <div className="flex flex-col items-center justify-center h-screen w-full">
            <h1 className="text-4xl font-bold">Employee Notification</h1>
        </div>
    </div>
  );
}

export default EmNotification;