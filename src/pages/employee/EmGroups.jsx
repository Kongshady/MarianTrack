import EmSideBar from "../../components/EmSidebar"

function EmGroups() {
  return (
    <div className="flex">
        <EmSideBar />
        <div className="flex flex-col items-center justify-center h-screen w-full">
            <h1 className="text-4xl font-bold">Groups</h1>
        </div>
    </div>
  )
}

export default EmGroups