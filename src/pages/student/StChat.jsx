import StSideBar from "../../components/StSidebar.jsx";

function StChat() {
    return (
        <div className="flex">
            <StSideBar />
            <div className="flex flex-col items-center justify-center h-screen w-full">
                <h1 className="text-4xl font-bold">Chats</h1>
            </div>
        </div>
    );
}

export default StChat