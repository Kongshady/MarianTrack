import { useEffect, useState } from "react";
import { auth, db } from "../../config/marian-config"; // Import Firebase auth and Firestore
import { doc, getDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import IncubateeSidebar from "../../components/sidebar/IncubateeSidebar.jsx";

function IncuDashboard() {
    const [userName, setUserName] = useState("");
    const [tasks, setTasks] = useState([]);
    const [userGroupId, setUserGroupId] = useState(null); // State to store the user's group ID
    const [totalRequests, setTotalRequests] = useState(0); // State for total requests
    const [ongoingRequests, setOngoingRequests] = useState(0); // State for ongoing requests
    const [toBeRequestedRequests, setToBeRequestedRequests] = useState(0); // State for "To be Requested" requests
    const [requestedRequests, setRequestedRequests] = useState(0); // State for "Requested" requests

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

        fetchUserNameAndGroup();
    }, []);

    const fetchTasks = async () => {
        try {
            if (!userGroupId) return; // Wait until the user's group ID is fetched

            const workplanQuery = query(
                collection(db, "workplan"),
                where("groupId", "==", userGroupId) // Fetch tasks belonging to the user's group
            );

            const querySnapshot = await getDocs(workplanQuery);
            const tasksData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setTasks(tasksData); // Set the tasks in state

            // Check for tasks due this week and add notifications
            const { startOfWeek, endOfWeek } = getCurrentWeekRange();
            const dueTasks = tasksData.filter((task) => {
                const taskDueDate = task.endDate ? new Date(task.endDate) : null;
                return (
                    taskDueDate &&
                    taskDueDate >= startOfWeek &&
                    taskDueDate <= endOfWeek &&
                    task.status !== "Completed"
                );
            });

            if (dueTasks.length > 0) {
                await addNotification();
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    const addNotification = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                const notificationQuery = query(
                    collection(db, "notifications"),
                    where("userId", "==", user.uid),
                    where("type", "==", "task_due_this_week")
                );

                const existingNotifications = await getDocs(notificationQuery);

                // Avoid duplicate notifications
                if (existingNotifications.empty) {
                    await addDoc(collection(db, "notifications"), {
                        userId: user.uid,
                        type: "task_due_this_week",
                        message: "Your tasks for this week are about to end. Please update them.",
                        createdAt: new Date(),
                    });
                }
            }
        } catch (error) {
            console.error("Error adding notification:", error);
        }
    };

    const fetchRequests = async () => {
        try {
            if (!userGroupId) return; // Wait until the user's group ID is fetched

            const requestsQuery = query(
                collection(db, "requests"),
                where("groupId", "==", userGroupId) // Fetch requests belonging to the user's group
            );

            const querySnapshot = await getDocs(requestsQuery);

            const requestsData = querySnapshot.docs.map((doc) => doc.data());
            setTotalRequests(requestsData.length); // Total number of group requests

            // Filter ongoing requests (e.g., status is "On-going")
            const ongoing = requestsData.filter((request) => request.status === "On-going");
            setOngoingRequests(ongoing.length); // Set the number of ongoing requests

            // Filter "To be Requested" requests
            const toBeRequested = requestsData.filter((request) => request.status === "To be requested");
            setToBeRequestedRequests(toBeRequested.length); // Set the number of "To be Requested" requests

            // Filter "Requested" requests
            const requested = requestsData.filter((request) => request.status === "Requested");
            setRequestedRequests(requested.length); // Set the number of "Requested" requests
        } catch (error) {
            console.error("Error fetching requests:", error);
        }
    };

    useEffect(() => {
        if (userGroupId) {
            fetchTasks();
            fetchRequests();
        }
    }, [userGroupId]); // Fetch tasks and requests only after the user's group ID is available

    // Helper function to get the start and end of the current week
    const getCurrentWeekRange = () => {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Set to Monday
        startOfWeek.setHours(0, 0, 0, 0); // Start of the day

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to Sunday
        endOfWeek.setHours(23, 59, 59, 999); // End of the day

        return { startOfWeek, endOfWeek };
    };

    // Filter tasks to only include those due this week and not completed
    const filteredTasks = tasks.filter((task) => {
        const { startOfWeek, endOfWeek } = getCurrentWeekRange();
        const taskDueDate = task.endDate ? new Date(task.endDate) : null;

        return (
            taskDueDate &&
            taskDueDate >= startOfWeek &&
            taskDueDate <= endOfWeek &&
            task.status !== "Completed"
        );
    });

    return (
        <div className="flex">
            <IncubateeSidebar />
            <div className="flex flex-col h-screen w-full p-10 bg-gray-100">
                {/* Welcome Section */}
                <h1 className="text-3xl font-bold">Welcome, {userName || "User"}!</h1>
                <p className="text-sm text-gray-600 mb-6">Here's an overview of your tasks for the week.</p>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    {/* Total Tasks Card */}
                    <div className="p-4 bg-white rounded-sm shadow-md hover:shadow-lg transition duration-200">
                        <h3 className="text-lg font-medium text-gray-700">Total Tasks</h3>
                        <p className="text-3xl font-bold text-blue-500 mt-2">{tasks.length}</p>
                    </div>

                    {/* Total Requests Card */}
                    <div className="p-4 bg-white rounded-sm shadow-md hover:shadow-lg transition duration-200">
                        <h3 className="text-lg font-medium text-gray-700">Total Requests</h3>
                        <p className="text-3xl font-bold text-green-500 mt-2">{totalRequests}</p>
                    </div>

                    {/* Ongoing Requests Card */}
                    <div className="p-4 bg-white rounded-sm shadow-md hover:shadow-lg transition duration-200">
                        <h3 className="text-lg font-medium text-gray-700">Ongoing Requests</h3>
                        <p className="text-3xl font-bold text-orange-500 mt-2">{ongoingRequests}</p>
                    </div>

                    {/* To be Requested Requests Card */}
                    <div className="p-4 bg-white rounded-sm shadow-md hover:shadow-lg transition duration-200">
                        <h3 className="text-lg font-medium text-gray-700">To be Requested</h3>
                        <p className="text-3xl font-bold text-purple-500 mt-2">{toBeRequestedRequests}</p>
                    </div>

                    {/* Requested Requests Card */}
                    <div className="p-4 bg-white rounded-sm shadow-md hover:shadow-lg transition duration-200">
                        <h3 className="text-lg font-medium text-gray-700">Requested</h3>
                        <p className="text-3xl font-bold text-teal-500 mt-2">{requestedRequests}</p>
                    </div>
                </div>

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