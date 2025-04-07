import { useEffect, useState } from "react";
import AdminSideBar from "../../components/sidebar/AdminSidebar.jsx";
import { db } from "../../config/marian-config.js";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";

function AdDashboard() {
  const [totalGroups, setTotalGroups] = useState(0); // State for total groups
  const [totalIncubatees, setTotalIncubatees] = useState(0); // State for total incubatees/users
  const [totalRequests, setTotalRequests] = useState(0); // State for total requests
  const [completedGroups, setCompletedGroups] = useState(0); // State for groups with completed workplans
  const [pendingUsers, setPendingUsers] = useState(0); // State for pending users
  const [userName, setUserName] = useState(""); // State for the logged-in user's name

  useEffect(() => {
    document.title = "Admin | Dashboard"; // Set the page title

    const fetchDashboardData = async () => {
      try {
        // Fetch total groups
        const groupsSnapshot = await getDocs(collection(db, "groups"));
        setTotalGroups(groupsSnapshot.size);

        // Fetch total incubatees/users (excluding specific roles)
        const usersQuery = query(
          collection(db, "users"),
          where("role", "not-in", ["TBI Manager", "TBI Assistant", "Portfolio Manager"])
        );
        const usersSnapshot = await getDocs(usersQuery);
        setTotalIncubatees(usersSnapshot.size);

        // Fetch total requests
        const requestsSnapshot = await getDocs(collection(db, "requests"));
        setTotalRequests(requestsSnapshot.size);

        // Fetch groups with completed workplans
        const completedGroupsQuery = query(
          collection(db, "groups"),
          where("workplanStatus", "==", "Completed")
        );
        const completedGroupsSnapshot = await getDocs(completedGroupsQuery);
        setCompletedGroups(completedGroupsSnapshot.size);

        // Fetch pending users
        const pendingUsersQuery = query(
          collection(db, "users"),
          where("status", "==", "pending") // Filter users with status "pending"
        );
        const pendingUsersSnapshot = await getDocs(pendingUsersQuery);
        setPendingUsers(pendingUsersSnapshot.size);

        // Fetch the logged-in user's name
        const userId = "currentUserId"; // Replace with the actual logged-in user's ID
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          setUserName(userDoc.data().name);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex">
      <AdminSideBar />
      <div className="flex flex-col items-start justify-start h-screen w-full p-10 bg-gray-100">
        <h1 className="text-4xl font-bold mb-5">
          Welcome, {userName || "Admin"}!
        </h1>
        <p className="text-lg text-gray-600 mb-8">Here's an overview of the system's statistics.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 w-full text-center">
          {/* Total Groups Card */}
          <div className="p-6 bg-white shadow rounded-lg">
            <h2 className="text-md font-medium text-gray-800">Total Groups</h2>
            <p className="text-xl font-bold text-blue-500 mt-4">{totalGroups}</p>
          </div>

          {/* Total Incubatees Card */}
          <div className="p-6 bg-white shadow rounded-lg">
            <h2 className="text-md font-medium text-gray-800">Total Incubatees</h2>
            <p className="text-xl font-bold text-blue-500 mt-4">{totalIncubatees}</p>
          </div>

          {/* Total Requests Card */}
          <div className="p-6 bg-white shadow rounded-lg">
            <h2 className="text-md font-medium text-gray-800">Total Requests</h2>
            <p className="text-xl font-bold text-blue-500 mt-4">{totalRequests}</p>
          </div>

          {/* Completed Groups Card */}
          <div className="p-6 bg-white shadow rounded-lg">
            <h2 className="text-md font-medium text-gray-800">Completed Groups</h2>
            <p className="text-xl font-bold text-blue-500 mt-4">{completedGroups}</p>
          </div>

          {/* Pending Users Card */}
          <div className="p-6 bg-white shadow rounded-lg">
            <h2 className="text-md font-medium text-gray-800">Pending Request Users</h2>
            <p className="text-xl font-bold text-blue-500 mt-4">{pendingUsers}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdDashboard;