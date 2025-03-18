import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../config/marian-config.js";
import EmployeeSidebar from "../../components/sidebar/EmployeeSidebar.jsx";

function EmChat() {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [projectManager, setProjectManager] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        document.title = "Employee | Chats"; // Set the page title

        const fetchGroups = async () => {
            const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const groupQuerySnapshot = await getDocs(collection(db, "groups"));
                const userGroups = groupQuerySnapshot.docs.filter(groupDoc =>
                    groupDoc.data().members.some(member => member.email === userData.email) ||
                    groupDoc.data().portfolioManager.email === userData.email
                ).map(groupDoc => ({
                    id: groupDoc.id,
                    ...groupDoc.data()
                }));
                setGroups(userGroups);
            }
        };

        fetchGroups();
    }, []);

    useEffect(() => {
        if (selectedGroup) {
            const fetchProjectManager = async () => {
                const querySnapshot = await getDocs(collection(db, "users"));
                const usersList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                const pm = usersList.find(user =>
                    user.role === "Project Manager" &&
                    (selectedGroup.members.some(member => member.email === user.email) ||
                    selectedGroup.portfolioManager.email === user.email)
                );
                setProjectManager(pm);
            };

            fetchProjectManager();
        }
    }, [selectedGroup]);

    useEffect(() => {
        if (projectManager) {
            const q = query(
                collection(db, "messages"),
                orderBy("timestamp", "asc")
            );
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const messagesList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMessages(messagesList.filter(message =>
                    (message.senderId === auth.currentUser.uid && message.receiverId === projectManager.id) ||
                    (message.senderId === projectManager.id && message.receiverId === auth.currentUser.uid)
                ));
            });

            return () => unsubscribe();
        }
    }, [projectManager]);

    const handleSendMessage = async () => {
        if (newMessage.trim() === "") return;

        await addDoc(collection(db, "messages"), {
            senderId: auth.currentUser.uid,
            receiverId: projectManager.id,
            message: newMessage,
            timestamp: new Date()
        });

        setNewMessage("");
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleString("en-US", {
            month: "long",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    };

    return (
        <div className="flex">
            <EmployeeSidebar />
            <div className="flex flex-col items-start justify-start h-screen w-full p-10 bg-gray-100">
                <h1 className="text-4xl font-bold mb-6">Chat</h1>
                <div className="flex w-full max-w-6xl bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="w-1/4 border-r">
                        <h2 className="text-md font-semibold p-4 border-b">Groups</h2>
                        <ul className="overflow-y-auto h-48 text-xs">
                            {groups.map(group => (
                                <li
                                    key={group.id}
                                    className={`p-4 cursor-pointer hover:bg-gray-200 ${selectedGroup?.id === group.id ? "bg-gray-200" : ""}`}
                                    onClick={() => setSelectedGroup(group)}
                                >
                                    {group.name}
                                </li>
                            ))}
                        </ul>
                        {selectedGroup && projectManager && (
                            <>
                                <h2 className="text-sm font-semibold p-4 border-b mt-4">Project Manager</h2>
                                <ul className="overflow-y-auto h-48">
                                    <li
                                        key={projectManager.id}
                                        className={`p-4 cursor-pointer hover:bg-gray-200 ${projectManager?.id === projectManager.id ? "bg-gray-200" : ""}`}
                                        onClick={() => setSelectedUser(projectManager)}
                                    >
                                        <div className="flex items-center">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm">{projectManager.name} {projectManager.lastname}</span>
                                                <span className="text-xs text-gray-500">{projectManager.role}</span>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </>
                        )}
                    </div>
                    <div className="w-3/4 flex flex-col">
                        <div className="flex-1 p-4 overflow-y-auto">
                            {projectManager ? (
                                <>
                                    <div className="flex items-center mb-4">
                                        <div className="flex flex-col">
                                            <h2 className="text-md font-semibold">{projectManager.name} {projectManager.lastname}</h2>
                                            <span className="text-xs text-gray-500">{projectManager.role}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col space-y-1">
                                        {messages.map(message => (
                                            <div
                                                key={message.id}
                                                className={`p-2 rounded-sm text-sm ${message.senderId === auth.currentUser.uid ? "bg-blue-500 text-white self-end" : "bg-gray-200 self-start"}`}
                                                title={formatTimestamp(message.timestamp)}
                                            >
                                                {message.message}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="text-center text-gray-500">Select a group to start chatting with the Project Manager</p>
                            )}
                        </div>
                        {projectManager && (
                            <div className="p-4 border-t flex items-center">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="w-full p-2 border text-sm rounded-sm"
                                    placeholder="Type your message..."
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className="ml-2 px-4 py-2 bg-primary-color text-white text-sm rounded-sm hover:bg-opacity-80 transition"
                                >
                                    Send
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmChat;