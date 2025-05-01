import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../config/marian-config.js";
import { doc, getDoc, collection, query, where, getDocs, updateDoc, addDoc } from "firebase/firestore";
import { FaPencilAlt } from "react-icons/fa";
import EmployeeSidebar from "../sidebar/EmployeeSidebar.jsx";

function EmViewGroup() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [requests, setRequests] = useState([]);
  const [workplan, setWorkplan] = useState([]);
  const [activeTable, setActiveTable] = useState("requests");
  const [groupMembers, setGroupMembers] = useState([]);
  const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const groupDoc = await getDoc(doc(db, "groups", groupId));
        if (groupDoc.exists()) {
          const groupData = groupDoc.data();

          const membersWithDetails = await Promise.all(
            groupData.members.map(async (member) => {
              const memberDoc = await getDoc(doc(db, "users", member.id));
              if (memberDoc.exists()) {
                return { ...member, ...memberDoc.data() };
              }
              return member;
            })
          );

          setGroup({ id: groupDoc.id, ...groupData });
          setGroupMembers(membersWithDetails);
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
      await updateDoc(doc(db, "requests", requestId), { status: newStatus });

      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === requestId ? { ...request, status: newStatus } : request
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleRemarksSave = async () => {
    try {
      await updateDoc(doc(db, "requests", currentRequest.id), { remarks });
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === currentRequest.id ? { ...request, remarks } : request
        )
      );
      setIsRemarksModalOpen(false);
      setCurrentRequest(null);
      setRemarks("");
    } catch (error) {
      console.error("Error saving remarks:", error);
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
      <div className="flex flex-col items-start h-screen w-full p-10 overflow-y-auto">
        <h1 className="text-4xl font-bold mb-2">{group.name}</h1>
        <p className="text-sm italic">{group.description}</p>
        {group.imageUrl && (
          <img
            src={group.imageUrl}
            alt={group.name}
            className="mt-2 w-full h-40 object-cover rounded-lg"
          />
        )}
        <div className="mt-2 flex flex-col justify-between items-start w-full gap-4 mb-4">
          {/* Members List */}
          <div>
            <h3 className="font-bold text-md">Members:</h3>
            <ul className="text-sm">
              {groupMembers.map((member) => (
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
              <p className="font-bold mb-2">Requested Needs</p>
              <table className="min-w-full bg-white text-xs text-left">
                <thead className="sticky top-0 bg-primary-color text-white">
                  <tr>
                    <th className="p-2 font-medium">Responsible Team Member</th>
                    <th className="p-2 font-medium">Request Type</th>
                    <th className="p-2 font-medium">Description</th>
                    <th className="p-2 font-medium">Date Entry</th>
                    <th className="p-2 font-medium">Date Needed</th>
                    <th className="p-2 font-medium">Resource/Tool Needed</th>
                    <th className="p-2 font-medium">Prospect Resource Person</th>
                    <th className="p-2 font-medium">Priority Level</th>
                    <th className="p-2 font-medium">Remarks</th>
                    <th className="p-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length > 0 ? (
                    [...requests]
                      .sort((a, b) => {
                        const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
                        if (a.status === "Done" && b.status !== "Done") return 1;
                        if (a.status !== "Done" && b.status === "Done") return -1;
                        if (priorityOrder[a.priorityLevel] !== priorityOrder[b.priorityLevel]) {
                          return priorityOrder[a.priorityLevel] - priorityOrder[b.priorityLevel];
                        }
                        return new Date(a.dateEntry) - new Date(b.dateEntry);
                      })
                      .map((request, index) => (
                        <tr
                          key={request.id}
                          className={`${
                            request.status === "Done" ? "bg-gray-200 opacity-70" : index % 2 === 0 ? "bg-white" : "bg-gray-100"
                          }`}
                        >
                          <td className="p-2">{request.responsibleTeamMember}</td>
                          <td className="p-2">{request.requestType}</td>
                          <td className="p-2">{request.description}</td>
                          <td className="p-2">
                            {new Date(request.dateEntry.seconds * 1000).toLocaleDateString()}
                          </td>
                          <td className="p-2">{request.dateNeeded}</td>
                          <td className="p-2">{request.resourceToolNeeded}</td>
                          <td className="p-2">{request.prospectResourcePerson}</td>
                          <td
                            className={`p-2 font-bold ${
                              request.priorityLevel === "HIGH"
                                ? "text-red-500"
                                : request.priorityLevel === "MEDIUM"
                                ? "text-yellow-500"
                                : "text-green-500"
                            }`}
                          >
                            {request.priorityLevel}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              onClick={() => {
                                setCurrentRequest(request);
                                setRemarks(request.remarks || "");
                                setIsRemarksModalOpen(true);
                              }}
                              className="text-blue-500 hover:underline"
                            >
                              <FaPencilAlt />
                            </button>
                          </td>
                          <td className="p-2">
                            <select
                              value={request.status || "Pending"}
                              onChange={(e) => handleStatusChange(request.id, e.target.value)}
                              className="p-1 border rounded"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Requested">Requested</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Done">Done</option>
                            </select>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td className="p-2 text-center" colSpan="10">
                        No requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTable === "workplan" && (
            <div className="overflow-y-auto mt-1">
              <p className="font-bold mb-2">Project Workplan</p>
              <table className="min-w-full bg-white text-xs text-left">
                <thead className="sticky top-0 bg-primary-color text-white">
                  <tr>
                    <th className="p-2 font-medium">Task Name</th>
                    <th className="p-2 font-medium text-right">Assigned To</th>
                    <th className="p-2 font-medium">Start Date</th>
                    <th className="p-2 font-medium">End Date</th>
                    <th className="p-2 font-medium">Priority Level</th> {/* New Priority Level Column */}
                    <th className="p-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {workplan.length > 0 ? (
                    workplan
                      .slice() // Create a shallow copy to avoid mutating the original array
                      .sort((a, b) => {
                        const priorityOrder = { High: 1, Medium: 2, Low: 3 };
                        if (priorityOrder[a.priorityLevel] !== priorityOrder[b.priorityLevel]) {
                          return priorityOrder[a.priorityLevel] - priorityOrder[b.priorityLevel];
                        }
                        return new Date(a.startDate) - new Date(b.startDate); // Sort by start date if priority is the same
                      })
                      .map((task, index) => (
                        <tr
                          key={task.id}
                          className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                        >
                          <td className="p-2">{task.taskName}</td>
                          <td className="p-2 text-right">{task.assignedTo}</td>
                          <td className="p-2">
                            {task.startDate
                              ? new Date(task.startDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                              : "N/A"}
                          </td>
                          <td className="p-2">
                            {task.endDate
                              ? new Date(task.endDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                              : "N/A"}
                          </td>
                          <td
                            className={`p-2 font-bold ${
                              task.priorityLevel === "High"
                                ? "text-red-500"
                                : task.priorityLevel === "Medium"
                                ? "text-yellow-500"
                                : "text-green-500"
                            }`}
                          >
                            {task.priorityLevel}
                          </td>
                          <td
                            className={`p-2 font-semibold ${task.status === "Pending"
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
                      <td className="py-2 px-4 text-center" colSpan="6">
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

      {isRemarksModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
            <h2 className="text-xl font-bold mb-4 text-center">Edit Remarks</h2>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-2 border text-sm"
              placeholder="Enter remarks here..."
            ></textarea>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsRemarksModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white text-sm rounded-sm hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRemarksSave}
                className="px-4 py-2 bg-primary-color text-white text-sm rounded-sm hover:bg-opacity-80 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmViewGroup;