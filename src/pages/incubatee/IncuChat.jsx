import { useEffect } from "react";
import IncubateeSidebar from "../../components/IncubateeSidebar.jsx";

function IncuChat() {
    useEffect(() => {
        document.title = "Incubatee | Chats"; // Set the page title
    }, []);

    return (
        <div className="flex">
            <IncubateeSidebar />
            <div className="flex flex-col items-center justify-center h-screen w-full">
                <h1 className="text-4xl font-bold">Chats</h1>
            </div>
        </div>
    );
}

export default IncuChat;
