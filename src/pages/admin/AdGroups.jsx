import AdminSidebar from "../../components/AdminSidebar.jsx"

function AdGroups() {
  return (
    <div className="flex">
        <AdminSidebar />
        <div className="flex flex-col items-center justify-center h-screen w-full">
            <h1 className="text-4xl font-bold">Admin Groups</h1>
        </div>
    </div>
  )
}

export default AdGroups