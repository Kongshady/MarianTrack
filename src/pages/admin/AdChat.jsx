import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../config/marian-config.js";
import AdminSidebar from "../../components/sidebar/AdminSidebar.jsx";

function AdChat() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        document.title = "Admin | Chats"; // Set the page title

        const fetchUsersAndGroups = async () => {
            const usersSnapshot = await getDocs(collection(db, "users"));
            const groupsSnapshot = await getDocs(collection(db, "groups"));

            const usersList = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const groupsList = groupsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setGroups(groupsList);

            const filteredUsers = usersList.filter(user => 
                user.id !== auth.currentUser.uid && 
                ["Portfolio Manager", "Project Manager", "TBI Assistant"].includes(user.role)
            ).map(user => {
                const userGroup = groupsList.find(group => 
                    group.members.some(member => member.email === user.email) ||
                    group.portfolioManager.email === user.email
                );
                return { ...user, groupName: userGroup ? userGroup.name : "No Group" };
            });

            setUsers(filteredUsers);
        };

        fetchUsersAndGroups();
    }, []);

    useEffect(() => {
        if (selectedUser) {
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
                    (message.senderId === auth.currentUser.uid && message.receiverId === selectedUser.id) ||
                    (message.senderId === selectedUser.id && message.receiverId === auth.currentUser.uid)
                ));
            });

            return () => unsubscribe();
        }
    }, [selectedUser]);

    const handleSendMessage = async () => {
        if (newMessage.trim() === "") return;

        await addDoc(collection(db, "messages"), {
            senderId: auth.currentUser.uid,
            receiverId: selectedUser.id,
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
            <AdminSidebar />
            <div className="flex flex-col items-start justify-start h-screen w-full p-10 bg-gray-100">
                <h1 className="text-4xl font-bold mb-6">Chat</h1>
                <div className="flex w-full max-w-6xl bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="w-1/4 border-r">
                        <h2 className="text-md font-semibold p-4 border-b">Users</h2>
                        <ul className="overflow-y-auto h-96">
                            {users.map(user => (
                                <li
                                    key={user.id}
                                    className={`p-4 cursor-pointer hover:bg-gray-200 ${selectedUser?.id === user.id ? "bg-gray-200" : ""}`}
                                    onClick={() => setSelectedUser(user)}
                                >
                                    <div className="flex items-center">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">{user.name} {user.lastname}</span>
                                            <span className="text-xs text-gray-500">{user.role}</span>
                                            {user.role === "Project Manager" && (
                                                <span className="text-xs text-gray-400">{user.groupName}</span>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="w-3/4 flex flex-col">
                        <div className="flex-1 p-4 overflow-y-auto">
                            {selectedUser ? (
                                <>
                                    <div className="flex items-center mb-4">
                                        <div className="flex flex-col">
                                            <h2 className="text-md font-semibold">{selectedUser.name} {selectedUser.lastname}</h2>
                                            <span className="text-xs text-gray-500">{selectedUser.role}</span>
                                            {selectedUser.role === "Project Manager" && (
                                                <span className="text-xs text-gray-400">{selectedUser.groupName}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col space-y-1">
                                        {messages.map(message => (
                                            <div
                                                key={message.id}
                                                className={`p-2 rounded-md text-sm ${message.senderId === auth.currentUser.uid ? "bg-blue-400 text-white self-end" : "bg-gray-200 self-start"}`}
                                                title={formatTimestamp(message.timestamp)}
                                            >
                                                {message.message}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="text-center text-gray-500">Select a user to start chatting</p>
                            )}
                        </div>
                        {selectedUser && (
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

export default AdChat;