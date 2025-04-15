import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth"; // Import Firebase Auth
import AdminSideBar from "../../components/sidebar/AdminSidebar.jsx";
import { db } from "../../config/marian-config.js";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";

function AdDashboard() {
  const [totalGroups, setTotalGroups] = useState(0);
  const [totalIncubatees, setTotalIncubatees] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [completedGroups, setCompletedGroups] = useState(0);
  const [pendingUsers, setPendingUsers] = useState(0);
  const [userName, setUserName] = useState("");
  const [groups, setGroups] = useState([]);
  const [groupRequests, setGroupRequests] = useState({});
  const [groupProgress, setGroupProgress] = useState({});

  useEffect(() => {
    document.title = "Admin | Dashboard";

    const fetchDashboardData = async () => {
      try {
        // Fetch total groups
        const groupsSnapshot = await getDocs(collection(db, "groups"));
        const groupsData = groupsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGroups(groupsData);
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
          where("status", "==", "pending")
        );
        const pendingUsersSnapshot = await getDocs(pendingUsersQuery);
        setPendingUsers(pendingUsersSnapshot.size);

        // Fetch group requests count
        const groupRequestsCount = {};
        requestsSnapshot.docs.forEach((doc) => {
          const request = doc.data();
          if (request.groupId) {
            groupRequestsCount[request.groupId] =
              (groupRequestsCount[request.groupId] || 0) + 1;
          }
        });
        setGroupRequests(groupRequestsCount);

        // Fetch group progress
        const groupProgressData = {};
        groupsData.forEach((group) => {
          if (group.workplan && group.workplan.length > 0) {
            const completedTasks = group.workplan.filter(
              (task) => task.status === "Completed"
            ).length;
            groupProgressData[group.id] = Math.round(
              (completedTasks / group.workplan.length) * 100
            );
          } else {
            groupProgressData[group.id] = 0;
          }
        });
        setGroupProgress(groupProgressData);

        // Fetch the logged-in user's name and last name
        const auth = getAuth(); // Get the Firebase Auth instance
        const user = auth.currentUser; // Get the currently logged-in user
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid)); // Fetch the user's document
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(`${userData.name} ${userData.lastname}`); // Set the user's full name
          }
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
      <div className="flex flex-col items-start justify-start h-svh overflow-x-auto w-full p-10 bg-gray-100">
        <h1 className="text-4xl mb-2 font-bold">
          Welcome, {userName || "Admin"}!
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Here's an overview of the system's statistics.
        </p>
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

          {/* Total Requests Card */}
          <div className="p-6 bg-white shadow">
            <h2 className="text-md font-medium text-gray-800">Total Requests</h2>
            <p className="text-xl font-bold text-blue-500 mt-4">{totalRequests}</p>
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

        {/* Groups and Number of Requests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-4">
          <div className="bg-white p-4 rounded-sm shadow w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Groups and Number of Requests
            </h2>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 top-0 sticky">
                  <tr>
                    <th scope="col" className="px-4 py-2">Group Name</th>
                    <th scope="col" className="px-4 py-2">Number of Requests</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => (
                    <tr key={group.id} className="border-b last:border-b-0">
                      <td className="px-4 py-2">{group.name}</td>
                      <td className="px-4 py-2">{groupRequests[group.id] || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Groups and Total Progress Completion */}
          <div className="bg-white p-4 rounded-sm shadow w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Groups and Total Progress Completion
            </h2>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 top-0 sticky">
                  <tr>
                    <th scope="col" className="px-4 py-2">Group Name</th>
                    <th scope="col" className="px-4 py-2">Total Progress (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => (
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