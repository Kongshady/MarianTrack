import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth"; // Import Firebase Auth
import AdminSideBar from "../../components/sidebar/AdminSidebar.jsx";
import { db } from "../../config/marian-config.js";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";

function AdDashboard() {
  const [totalGroups, setTotalGroups] = useState(0);
  const [totalIncubatees, setTotalIncubatees] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [completedRequests, setCompletedRequests] = useState(0);
  const [ongoingRequests, setOngoingRequests] = useState(0);
  const [completedGroups, setCompletedGroups] = useState(0);
  const [pendingUsers, setPendingUsers] = useState(0);
  const [groups, setGroups] = useState([]);
  const [groupRequests, setGroupRequests] = useState({});
  const [groupProgress, setGroupProgress] = useState({});
  const [userName, setUserName] = useState("");
  const [isFlipped, setIsFlipped] = useState(false); // State for flip card

  useEffect(() => {
    document.title = "Admin | Dashboard";

    const fetchDashboardData = async () => {
      try {
        // Fetch the logged-in user's name
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(`${userData.name} ${userData.lastname}`);
          }
        }

        // Fetch all groups
        const groupsSnapshot = await getDocs(collection(db, "groups"));
        const groupsData = groupsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGroups(groupsData);
        setTotalGroups(groupsData.length);

        // Fetch total incubatees (excluding specific roles)
        const usersQuery = query(
          collection(db, "users"),
          where("role", "not-in", ["TBI Manager", "TBI Assistant", "Portfolio Manager"])
        );
        const usersSnapshot = await getDocs(usersQuery);
        setTotalIncubatees(usersSnapshot.size);

        // Fetch requests and count them per group
        const requestsSnapshot = await getDocs(collection(db, "requests"));
        const requestsData = requestsSnapshot.docs.map((doc) => doc.data());
        const requestsCount = {};
        let totalRequestsCount = 0;
        let completedCount = 0;
        let ongoingCount = 0;

        groupsData.forEach((group) => {
          const groupRequestCount = requestsData.filter(
            (request) => request.groupId === group.id
          ).length;
          requestsCount[group.id] = groupRequestCount;
          totalRequestsCount += groupRequestCount;

          // Count completed and ongoing requests
          requestsData.forEach((request) => {
            if (request.groupId === group.id) {
              if (request.status === "Completed") {
                completedCount++;
              } else if (
                request.status === "On-going" ||
                request.status === "To be requested" ||
                request.status === "Requested"
              ) {
                ongoingCount++;
              }
            }
          });
        });

        setGroupRequests(requestsCount);
        setTotalRequests(totalRequestsCount);
        setCompletedRequests(completedCount);
        setOngoingRequests(ongoingCount);

        // Fetch completed groups
        const completedGroupsQuery = query(
          collection(db, "groups"),
          where("workplanStatus", "==", "Completed")
        );
        const completedGroupsSnapshot = await getDocs(completedGroupsQuery);
        setCompletedGroups(completedGroupsSnapshot.size);

        // Fetch pending users
        const pendingUsersQuery = query(
          collection(db, "users"),
          where("status", "==", "pending")
        );
        const pendingUsersSnapshot = await getDocs(pendingUsersQuery);
        setPendingUsers(pendingUsersSnapshot.size);

        // Fetch workplan and calculate progress for each group
        const workplanSnapshot = await getDocs(collection(db, "workplan"));
        const workplanData = workplanSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const progressData = {};
        groupsData.forEach((group) => {
          const groupTasks = workplanData.filter(
            (task) => task.groupId === group.id
          );
          const totalTasks = groupTasks.length;
          const completedTasks = groupTasks.filter(
            (task) => task.status === "Completed"
          ).length;
          const progress = totalTasks > 0
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0;
          progressData[group.id] = progress;
        });
        setGroupProgress(progressData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex">
      <AdminSideBar />
      <div className="flex flex-col items-start justify-start h-screen w-full p-10 bg-gray-100 overflow-x-auto">
        <h1 className="text-4xl font-bold">Welcome, {userName || "Admin"}!</h1>
        <p className="text-sm text-gray-600 mb-4">Here's an overview of the Incubatees's statistics.</p>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 w-full text-center">
          {/* Total Groups Card */}
          <div className="p-6 bg-white shadow">
            <h2 className="text-md font-medium text-gray-800">Total Groups</h2>
            <p className="text-xl font-bold text-blue-500 mt-4">{totalGroups}</p>
          </div>

          {/* Total Incubatees Card */}
          <div className="p-6 bg-white shadow">
            <h2 className="text-md font-medium text-gray-800">Total Incubatees</h2>
            <p className="text-xl font-bold text-blue-500 mt-4">{totalIncubatees}</p>
          </div>

          {/* Flip Card for Total Requests */}
          <div
            className={`p-6 bg-white shadow transform transition-transform duration-500 ${
              isFlipped ? "rotate-y-180" : ""
            }`}
            onClick={() => setIsFlipped(!isFlipped)}
            style={{ perspective: "1000px", cursor: "pointer" }}
          >
            {!isFlipped ? (
              <div>
                <h2 className="text-md font-medium text-gray-800">Total No. of Requested Needs</h2>
                <p className="text-xl font-bold text-blue-500 mt-4">{totalRequests}</p>
                <p className="text-sm text-gray-500 mt-2">Click to view details</p>
              </div>
            ) : (
              <div>
                <h2 className="text-md font-medium text-gray-800">Request Breakdown</h2>
                <p className="text-sm text-gray-600 mt-4">
                  <strong>Completed:</strong> {completedRequests}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>On-going:</strong> {ongoingRequests}
                </p>
                <p className="text-sm text-gray-500 mt-2">Click to flip back</p>
              </div>
            )}
          </div>

          {/* Completed Groups Card */}
          <div className="p-6 bg-white shadow">
            <h2 className="text-md font-medium text-gray-800">Completed Groups</h2>
            <p className="text-xl font-bold text-blue-500 mt-4">{completedGroups}</p>
          </div>

          {/* Pending Users Card */}
          <div className="p-6 bg-white shadow">
            <h2 className="text-md font-medium text-gray-800">Pending Request Users</h2>
            <p className="text-xl font-bold text-blue-500 mt-4">{pendingUsers}</p>
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-4">
          {/* Table of Groups with Number of Requests */}
          <div className="bg-white p-4 rounded-sm shadow w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Groups and Number of Requests</h2>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th scope="col" className="px-4 py-2">Group Name</th>
                    <th scope="col" className="px-4 py-2">Number of Requests</th>
                  </tr>
                </thead>
                <tbody>
                  {groups
                    .sort((a, b) => (groupRequests[b.id] || 0) - (groupRequests[a.id] || 0))
                    .map((group) => (
                      <tr key={group.id} className="border-b last:border-b-0">
                        <td className="px-4 py-2">{group.name}</td>
                        <td className="px-4 py-2">{groupRequests[group.id] || 0}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table of Groups with Total Progress Completion */}
          <div className="bg-white p-4 rounded-sm shadow w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Groups and Total Progress Completion</h2>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th scope="col" className="px-4 py-2">Group Name</th>
                    <th scope="col" className="px-4 py-2">Total Progress (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {groups
                    .sort((a, b) => (groupProgress[b.id] || 0) - (groupProgress[a.id] || 0))
                    .map((group) => (
                      <tr key={group.id} className="border-b last:border-b-0">
                        <td className="px-4 py-2">{group.name}</td>
                        <td className="px-4 py-2">{groupProgress[group.id] || 0}%</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdDashboard;