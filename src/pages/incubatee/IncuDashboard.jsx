import { useEffect, useState } from "react";
import { auth, db } from "../../config/marian-config"; // Import Firebase auth and Firestore
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import IncubateeSidebar from "../../components/sidebar/IncubateeSidebar.jsx";

function IncuDashboard() {
    const [userName, setUserName] = useState("");
    const [tasks, setTasks] = useState([]);
    const [userGroupId, setUserGroupId] = useState(null); // State to store the user's group ID

    useEffect(() => {
        document.title = "Incubatee | Dashboard"; // Set the page title

        const fetchUserNameAndGroup = async () => {
            try {
                const user = auth.currentUser; // Get the currently logged-in user
                if (user) {
                    const userDocRef = doc(db, "users", user.uid); // Reference to the user's document
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUserName(`${userData.name} ${userData.lastname}`); // Set the user's full name
                        setUserGroupId(userData.groupId); // Set the user's group ID
                    }
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        const fetchTasks = async () => {
            try {
                const today = new Date();
                const endOfWeek = new Date();
                endOfWeek.setDate(today.getDate() + 7); // Calculate the end of the week

                const workplanQuery = query(
                    collection(db, "workplan"),
                    where("endDate", ">=", today.toISOString()), // Tasks with deadlines from today
                    where("endDate", "<=", endOfWeek.toISOString()) // Tasks with deadlines within the week
                );

                const querySnapshot = await getDocs(workplanQuery);
                const tasksData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setTasks(tasksData); // Set the tasks in state
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };

        fetchUserNameAndGroup();
        fetchTasks();
    }, []);

    // Filter tasks to only include those with status "Pending" or "In-Progress" and matching the user's group ID
    const filteredTasks = tasks.filter(
        (task) =>
            (task.status === "Pending" || task.status === "In Progress") &&
            task.groupId === userGroupId // Ensure the task's group ID matches the user's group ID
    );

    return (
        <div className="flex">
            <IncubateeSidebar />
            <div className="flex flex-col h-screen w-full p-10 bg-gray-100">
                {/* Welcome Section */}
                <h1 className="text-3xl font-bold mb-2">Welcome, {userName || "User"}!</h1>
                <p className="text-gray-600 mb-6">Here's an overview of your tasks for the week.</p>

                {/* Tasks Due This Week */}
                <div className="bg-white p-4 rounded-sm shadow-md hover:shadow-lg transition duration-200">
                    <h3 className="text-lg font-medium mb-4">Tasks Due This Week</h3>
                    {filteredTasks.length > 0 ? (
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                <tr>
                                    <th scope="col" className="px-4 py-2">Task Name</th>
                                    <th scope="col" className="px-4 py-2">Assigned Member</th>
                                    <th scope="col" className="px-4 py-2">Status</th>
                                    <th scope="col" className="px-4 py-2">Due Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTasks.map((task) => (
                                    <tr key={task.id} className="border-b last:border-b-0">
                                        <td className="px-4 py-2">{task.taskName}</td>
                                        <td className="px-4 py-2">{task.assignedTo || "Unassigned"}</td>
                                        <td className="px-4 py-2">
                                            <span
                                                className={`px-2 py-1 rounded text-white text-xs ${
                                                    task.status === "Pending"
                                                        ? "bg-orange-500"
                                                        : task.status === "In Progress"
                                                        ? "bg-blue-500"
                                                        : "bg-gray-500"
                                                }`}
                                            >
                                                {task.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">
                                            {task.endDate
                                                ? new Date(task.endDate).toLocaleDateString("en-US", {
                                                      year: "numeric",
                                                      month: "long",
                                                      day: "numeric",
                                                  })
                                                : "No Deadline"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-gray-500">No tasks due this week.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default IncuDashboard;