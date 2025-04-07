import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../config/marian-config.js";
import { doc, getDoc, collection, query, where, getDocs, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import EmployeeSidebar from "../sidebar/EmployeeSidebar.jsx";

function EmViewGroup() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [requests, setRequests] = useState([]);
  const [workplan, setWorkplan] = useState([]); // State for workplan
  const [activeTable, setActiveTable] = useState("requests"); // State to toggle between requests and workplan

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const groupDoc = await getDoc(doc(db, "groups", groupId));
        if (groupDoc.exists()) {
          setGroup({ id: groupDoc.id, ...groupDoc.data() });
        }
      } catch (error) {
        console.error("Error fetching group:", error);
      }
    };

    const fetchRequests = async () => {
      try {
        const q = query(collection(db, "requests"), where("groupId", "==", groupId));
        const querySnapshot = await getDocs(q);
        setRequests(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    const fetchWorkplan = async () => {
      try {
        const q = query(collection(db, "workplan"), where("groupId", "==", groupId));
        const querySnapshot = await getDocs(q);
        setWorkplan(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching workplan:", error);
      }
    };

    fetchGroup();
    fetchRequests();
    fetchWorkplan();
  }, [groupId]);

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      // Update the status of the request in Firestore
      await updateDoc(doc(db, "requests", requestId), { status: newStatus });

      // Update the status in the local state
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === requestId ? { ...request, status: newStatus } : request
        )
      );

      // Fetch the request details to get the groupId or responsible user
      const requestDoc = await getDoc(doc(db, "requests", requestId));
      if (requestDoc.exists()) {
        const requestData = requestDoc.data();

        // Fetch the user responsible for the request using the groupId
        const usersQuery = query(
          collection(db, "users"),
          where("groupId", "==", requestData.groupId) // Match the groupId from the request
        );

        const usersSnapshot = await getDocs(usersQuery);
        if (!usersSnapshot.empty) {
          usersSnapshot.forEach(async (userDoc) => {
            const userData = userDoc.data();

            // Add a notification for the user
            await addDoc(collection(db, "notifications"), {
              userId: userDoc.id, // Use the user's Firestore document ID
              message: `The status of your request for "${requestData.resourceToolNeeded}" has been updated to "${newStatus}".`,
              timestamp: serverTimestamp(),
              read: false,
            });
          });
        }
      }
    } catch (error) {
      console.error("Error updating status or sending notification:", error);
    }
  };

  if (!group) {
    return (
      <div className="flex items-center justify-center h-svh">
        Loading... Please Wait.
      </div>
    );
  }

  return (
    <div className="flex">
      <EmployeeSidebar />
      <div className="flex flex-col items-start h-screen w-full p-10">
        <h1 className="text-4xl font-bold mb-2">{group.name}</h1>
        <p className="text-sm italic">{group.description}</p>
        {group.imageUrl && (
          <img
            src={group.imageUrl}
            alt={group.name}
            className="mt-2 w-full h-40 object-cover rounded-lg"
          />
        )}
        <div className="mt-2 flex flex-row justify-between items-start w-full">
          {/* Members List */}
          <div>
            <h3 className="font-bold text-sm">Members:</h3>
            <ul className="text-sm">
              {group.members.map((member) => (
                <li key={member.id}>
                  {member.name} {member.lastname} - {member.role}
                </li>
              ))}
            </ul>
          </div>

          {/* Cards for workplan statistics */}
          <div className="flex gap-2 ">
            {/* Card for total number of tasks */}
            <div className="bg-blue-500 text-white text-center p-2 rounded-sm shadow-md">
              <h3 className="text-xs">No. of Tasks</h3>
              <p className="text-md font-semibold mt-1">{workplan.length}</p>
            </div>
            {/* Card for pending tasks */}
            <div className="bg-yellow-500 text-white text-center p-2 rounded-sm shadow-md">
              <h3 className="text-xs">Pending Tasks</h3>
              <p className="text-md font-semibold mt-1">
                {workplan.filter((task) => task.status === "Pending").length}
              </p>
            </div>
            {/* Card for completed tasks */}
            <div className="bg-green-500 text-white text-center p-2 rounded-sm shadow-md">
              <h3 className="text-xs">Completed Tasks</h3>
              <p className="text-md font-semibold mt-1">
                {workplan.filter((task) => task.status === "Completed").length}
              </p>
            </div>
            {/* Card for overall workplan completion */}
            <div
              className={`text-white text-center p-2 rounded-sm shadow-md ${workplan.length > 0
                  ? Math.round(
                    (workplan.filter((task) => task.status === "Completed").length /
                      workplan.length) *
                    100
                  ) >= 75
                    ? "bg-green-500"
                    : Math.round(
                      (workplan.filter((task) => task.status === "Completed").length /
                        workplan.length) *
                      100
                    ) >= 50
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  : "bg-gray-500"
                }`}
            >
              <h3 className="text-xs">Total Progress Completion</h3>
              <p className="text-md font-semibold mt-1">
                {workplan.length > 0
                  ? `${Math.round(
                    (workplan.filter((task) => task.status === "Completed").length /
                      workplan.length) *
                    100
                  )}%`
                  : "0%"}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-2 w-full">
          <div className="flex mb-4">
            <button
              onClick={() => setActiveTable("requests")}
              className={`${activeTable === "requests" ? "bg-primary-color text-white" : "bg-white border border-primary-color"
                } text-primary-color px-4 py-2 text-xs  hover:bg-opacity-80 transition`}
            >
              {activeTable === "requests" ? "Group Requests" : "Group Requests"}
            </button>
            <button
              onClick={() => setActiveTable("workplan")}
              className={`${activeTable === "workplan" ? "bg-primary-color text-white" : "bg-white border border-primary-color"
                } text-primary-color px-4 py-2 text-xs  hover:bg-opacity-80 transition`}
            >
              {activeTable === "workplan" ? "Project Workplan" : "Project Workplan"}
            </button>
          </div>
          {activeTable === "requests" && (
            <div className="overflow-y-auto h-80 mt-1">
              <table className="min-w-full bg-white border border-gray-200 text-xs text-center">
                <thead className="sticky top-0 bg-primary-color text-white">
                  <tr>
                    <th className="p-2 border-b">Responsible Team Member</th>
                    <th className="p-2 border-b">Request Type</th>
                    <th className="p-2 border-b">Description</th>
                    <th className="p-2 border-b">Date Entry</th>
                    <th className="p-2 border-b">Date Needed</th>
                    <th className="p-2 border-b">Resource/Tool Needed</th>
                    <th className="p-2 border-b">Prospect Resource Person</th>
                    <th className="p-2 border-b">Priority Level</th>
                    <th className="p-2 border-b">Remarks</th>
                    <th className="p-2 border-b">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length > 0 ? (
                    requests.map((request) => (
                      <tr key={request.id}>
                        <td className="py-2 px-4 border-b">{request.responsibleTeamMember}</td>
                        <td className="py-2 px-4 border-b">{request.requestType}</td>
                        <td className="py-2 px-4 border-b">{request.description}</td>
                        <td className="py-2 px-4 border-b">
                          {new Date(request.dateEntry.seconds * 1000).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-4 border-b">{request.dateNeeded}</td>
                        <td className="py-2 px-4 border-b">{request.resourceToolNeeded}</td>
                        <td className="py-2 px-4 border-b">{request.prospectResourcePerson}</td>
                        <td className="py-2 px-4 border-b">{request.priorityLevel}</td>
                        <td className="py-2 px-4 border-b">{request.remarks}</td>
                        <td className="py-2 px-4 border-b">
                          <select
                            value={request.status || "Requested"}
                            onChange={(e) => handleStatusChange(request.id, e.target.value)}
                            className="p-1 border rounded"
                          >
                            <option value="Done">Done</option>
                            <option value="On-going">On-going</option>
                            <option value="To be requested">To be requested</option>
                            <option value="Requested">Requested</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-2 px-4 border-b text-center" colSpan="10">
                        No requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {activeTable === "workplan" && (
            <div className="overflow-y-auto h-80 mt-1">
              <table className="min-w-full bg-white border border-gray-200 text-xs text-center">
                <thead className="sticky top-0 bg-primary-color text-white">
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Task Name</th>
                    <th className="py-2 px-4 border-b">Assigned To</th>
                    <th className="py-2 px-4 border-b">Start Date</th>
                    <th className="py-2 px-4 border-b">End Date</th>
                    <th className="py-2 px-4 border-b">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {workplan.length > 0 ? (
                    // Sort tasks by startDate before rendering
                    workplan
                      .slice() // Create a shallow copy to avoid mutating the original array
                      .sort((a, b) => {
                        const dateA = new Date(a.startDate);
                        const dateB = new Date(b.startDate);
                        return dateA - dateB; // Sort in ascending order
                      })
                      .map((task) => (
                        <tr key={task.id}>
                          <td className="p-2 border-b border-r text-left">{task.taskName}</td>
                          <td className="p-2 border-b">{task.assignedTo}</td>
                          <td className="p-2 border-b">
                            {task.startDate
                              ? new Date(task.startDate).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : "N/A"}
                          </td>
                          <td className="p-2 border-b">
                            {task.endDate
                              ? new Date(task.endDate).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : "N/A"}
                          </td>
                          <td
                            className={`p-2 border-b font-semibold ${
                              task.status === "Pending"
                                ? "text-red-500"
                                : task.status === "In Progress"
                                ? "text-yellow-500"
                                : task.status === "Completed"
                                ? "text-green-500"
                                : "text-gray-500"
                            }`}
                          >
                            {task.status}
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td className="py-2 px-4 border-b text-center" colSpan="5">
                        No tasks found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmViewGroup;