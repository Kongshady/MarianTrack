import { useEffect, useState } from "react";
import { auth, db } from "../../config/marian-config"; // Import Firebase auth and Firestore
import { doc, getDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { FaEye } from "react-icons/fa";
import IncubateeSidebar from "../../components/sidebar/IncubateeSidebar.jsx";

function IncuDashboard() {
    const [userName, setUserName] = useState("");
    const [tasks, setTasks] = useState([]);
    const [userGroupId, setUserGroupId] = useState(null); // State to store the user's group ID
    const [totalRequests, setTotalRequests] = useState(0); // State for total requests
    const [groupTasks, setGroupTasks] = useState([]); // State to store tasks from all groups
    const [groupRequests, setGroupRequests] = useState([]); // State to store requests from all groups

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
            const tasksData = querySnapshot.docs
                .map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }))
                .filter((task) => task.status !== "Completed"); // Exclude completed tasks

            setTasks(tasksData); // Set the tasks in state
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    const fetchRequests = async () => {
        try {
            const requestsQuery = query(collection(db, "requests"));
            const querySnapshot = await getDocs(requestsQuery);

            const requestsData = querySnapshot.docs
                .map((doc) => doc.data())
                .filter((request) => request.responsibleTeamMember === userName); // Filter requests by user name

            setTotalRequests(requestsData.length); // Set the total requests count
        } catch (error) {
            console.error("Error fetching requests:", error);
        }
    };

    const fetchGroupTasks = async () => {
        try {
            const user = auth.currentUser; // Get the currently logged-in user
            if (!user) return;

            const userDocRef = doc(db, "users", user.uid); // Reference to the user's document
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) return;

            const userData = userDoc.data();
            const userName = `${userData.name} ${userData.lastname}`; // Get the user's full name

            // Fetch all groups where the user is a member
            const groupsQuery = query(collection(db, "groups"));
            const groupsSnapshot = await getDocs(groupsQuery);

            const groupIds = groupsSnapshot.docs
                .filter((groupDoc) =>
                    groupDoc.data().members.some((member) => member.name === userData.name && member.lastname === userData.lastname)
                )
                .map((groupDoc) => ({
                    id: groupDoc.id,
                    name: groupDoc.data().name || "Unknown Group",
                }));

            if (groupIds.length === 0) {
                setGroupTasks([]); // No groups found
                return;
            }

            // Fetch all tasks for the user's groups in a single query
            const tasksQuery = query(
                collection(db, "workplan"),
                where("groupId", "in", groupIds.map((group) => group.id)) // Fetch tasks for all group IDs
            );

            const tasksSnapshot = await getDocs(tasksQuery);
            const tasksData = tasksSnapshot.docs
                .map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    groupName: groupIds.find((group) => group.id === doc.data().groupId)?.name || "Unknown Group",
                }))
                .filter(
                    (task) =>
                        task.assignedTo === userName && task.status !== "Completed" // Filter tasks assigned to the user and exclude completed tasks
                );

            // Sort tasks by priority: High > Medium > Low
            const sortedTasks = tasksData.sort((a, b) => {
                const priorityOrder = { High: 1, Medium: 2, Low: 3 };
                return priorityOrder[a.priorityLevel] - priorityOrder[b.priorityLevel];
            });

            setGroupTasks(sortedTasks); // Set all group tasks in state
        } catch (error) {
            console.error("Error fetching group tasks:", error);
        }
    };

    const fetchGroupRequests = async () => {
        try {
            const user = auth.currentUser; // Get the currently logged-in user
            if (!user) return;

            const userDocRef = doc(db, "users", user.uid); // Reference to the user's document
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) return;

            const userData = userDoc.data();
            const userName = `${userData.name} ${userData.lastname}`; // Get the user's full name

            // Fetch all groups where the user is a member
            const groupsQuery = query(collection(db, "groups"));
            const groupsSnapshot = await getDocs(groupsQuery);

            const groupIds = groupsSnapshot.docs
                .filter((groupDoc) =>
                    groupDoc.data().members.some((member) => member.name === userData.name && member.lastname === userData.lastname)
                )
                .map((groupDoc) => ({
                    id: groupDoc.id,
                    name: groupDoc.data().name || "Unknown Group",
                }));

            if (groupIds.length === 0) {
                setGroupRequests([]); // No groups found
                setTotalRequests(0); // Set total requests to 0
                return;
            }

            // Fetch all requests for the user's groups
            const requestsQuery = query(collection(db, "requests"));
            const requestsSnapshot = await getDocs(requestsQuery);

            const requestsData = requestsSnapshot.docs
                .map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    groupName: groupIds.find((group) => group.id === doc.data().groupId)?.name || "Unknown Group",
                }))
                .filter((request) => request.responsibleTeamMember === userName) // Filter requests by responsible team member
                .sort((a, b) => {
                    const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
                    return priorityOrder[a.priorityLevel] - priorityOrder[b.priorityLevel];
                }); // Sort requests by priority level

            setGroupRequests(requestsData); // Set all group requests in state
            setTotalRequests(requestsData.length); // Update the total requests count
        } catch (error) {
            console.error("Error fetching group requests:", error);
        }
    };

    useEffect(() => {
        if (userGroupId) {
            fetchTasks();
            fetchRequests();
        }
    }, [userGroupId]); // Fetch tasks and requests only after the user's group ID is available

    useEffect(() => {
        fetchGroupTasks();
        fetchGroupRequests();
    }, []);

    useEffect(() => {
        fetchGroupRequests();
    }, []);

    return (
        <div className="flex">
            <IncubateeSidebar />
            <div className="flex flex-col h-screen w-full p-10 bg-gray-100 overflow-y-auto">
                {/* Welcome Section */}
                <h1 className="text-3xl font-bold">Welcome, {userName || "User"}!</h1>
                <p className="text-sm text-gray-600 mb-6">Here's an overview of your tasks and groups.</p>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Total Tasks Card */}
                    <div className="p-4 bg-white rounded-sm shadow-md hover:shadow-lg transition duration-200">
                        <h3 className="text-lg font-medium text-gray-700">Total StartUp Tasks</h3>
                        <p className="text-3xl font-bold text-blue-500 mt-2">{groupTasks.length}</p>
                    </div>

                    {/* Total Requests Card */}
                    <div className="p-4 bg-white rounded-sm shadow-md hover:shadow-lg transition duration-200">
                        <h3 className="text-lg font-medium text-gray-700">Total StartUp Requests</h3>
                        <p className="text-3xl font-bold text-green-500 mt-2">{totalRequests}</p>
                    </div>
                </div>

                {/* All Tasks by Group */}
                <div className="bg-white p-4 rounded-sm shadow-md hover:shadow-lg transition duration-200">
                    <h3 className="text-lg font-medium mb-4">Startup-Based Task List</h3>
                    {groupTasks.length > 0 ? (
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                <tr>
                                    <th scope="col" className="px-4 py-2">Task Name</th>
                                    <th scope="col" className="px-4 py-2">Startup Name</th>
                                    <th scope="col" className="px-4 py-2">Priority Level</th>
                                    <th scope="col" className="px-4 py-2">Status</th>
                                    <th scope="col" className="px-4 py-2">Due Date</th>
                                    <th scope="col" className="px-4 py-2 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupTasks.map((task) => (
                                    <tr key={task.id} className="border-b last:border-b-0">
                                        <td className="px-4 py-2">{task.taskName}</td>
                                        <td className="px-4 py-2">{task.groupName}</td>
                                        <td
                                            className={`px-4 py-2 font-bold ${
                                                task.priorityLevel === "High"
                                                    ? "text-red-500"
                                                    : task.priorityLevel === "Medium"
                                                    ? "text-yellow-500"
                                                    : "text-green-500"
                                            }`}
                                        >
                                            {task.priorityLevel || "N/A"}
                                        </td>
                                        <td className="px-4 py-2">
                                            <span
                                                className={`px-2 py-1 rounded text-white text-xs ${
                                                    task.status === "Pending"
                                                        ? "bg-red-500"
                                                        : task.status === "Completed"
                                                        ? "bg-green-500"
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
                                        <td className="px-4 py-2 text-center">
                                            <button
                                                onClick={() => window.location.href = `/incubatee/view-group/${task.groupId}`}
                                                className="text-blue-500 hover:text-blue-700"
                                                title="View"
                                            >
                                                <FaEye />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-gray-500">No tasks assigned to you in any group.</p>
                    )}
                </div>

                {/* Startup-Based Requests List */}
                <div className="bg-white p-4 rounded-sm shadow-md hover:shadow-lg transition duration-200 mt-4">
                    <h3 className="text-lg font-medium mb-4">Startup-Based Requests List</h3>
                    {groupRequests.length > 0 ? (
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                <tr>
                                    <th scope="col" className="px-4 py-2">Specific Needs</th>
                                    <th scope="col" className="px-4 py-2">Startup Name</th>
                                    <th scope="col" className="px-4 py-2">Priority Level</th>
                                    <th scope="col" className="px-4 py-2">Status</th>
                                    <th scope="col" className="px-4 py-2">Remarks</th>
                                    <th scope="col" className="px-4 py-2 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupRequests.map((request) => (
                                    <tr key={request.id} className="border-b last:border-b-0">
                                        <td className="px-4 py-2">{request.resourceToolNeeded || "N/A"}</td>
                                        <td className="px-4 py-2">{request.groupName}</td>
                                        <td
                                            className={`px-4 py-2 font-bold ${
                                                request.priorityLevel === "HIGH"
                                                    ? "text-red-500"
                                                    : request.priorityLevel === "MEDIUM"
                                                    ? "text-yellow-500"
                                                    : "text-green-500"
                                            }`}
                                        >
                                            {request.priorityLevel || "N/A"}
                                        </td>
                                        <td className="px-4 py-2">
                                            <span
                                                className={`px-2 py-1 rounded text-white text-xs ${
                                                    request.status === "Pending"
                                                        ? "bg-red-500"
                                                        : request.status === "Requested"
                                                        ? "bg-orange-500"
                                                        : request.status === "In Progress"
                                                        ? "bg-green-500"
                                                        : "bg-gray-500"
                                                }`}
                                            >
                                                {request.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">{request.remarks || "No Remarks"}</td>
                                        <td className="px-4 py-2 text-center">
                                            <button
                                                onClick={() => window.location.href = `/incubatee/view-group/${request.groupId}`}
                                                className="text-blue-500 hover:text-blue-700"
                                                title="View"
                                            >
                                                <FaEye />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-gray-500">No requests assigned to you in any group.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default IncuDashboard;