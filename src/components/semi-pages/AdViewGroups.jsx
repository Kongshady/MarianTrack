import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../config/marian-config.js";
import { doc, query, where, onSnapshot, collection, updateDoc } from "firebase/firestore";
import AdminSidebar from "../sidebar/AdminSidebar.jsx";
import { MdEdit } from "react-icons/md";
import EditGroupModal from "../modals/EditGroupModal.jsx";

function AdViewGroups() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [requests, setRequests] = useState([]);
  const [workplan, setWorkplan] = useState([]);
  const [isRequestsTableOpen, setIsRequestsTableOpen] = useState(true);
  const [isWorkplanTableOpen, setIsWorkplanTableOpen] = useState(false);
  const [portfolioManager, setPortfolioManager] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchGroup = () => {
      const groupDocRef = doc(db, "groups", groupId);
      const unsubscribeGroup = onSnapshot(groupDocRef, (doc) => {
        if (doc.exists()) {
          const groupData = doc.data();
          setGroup({ id: doc.id, ...groupData });

          // Fetch portfolio manager details
          if (groupData.portfolioManager) {
            const portfolioManagerDocRef = doc(db, "users", groupData.portfolioManager.id);
            onSnapshot(portfolioManagerDocRef, (portfolioManagerDoc) => {
              if (portfolioManagerDoc.exists()) {
                setPortfolioManager(portfolioManagerDoc.data());
              }
            });
          }
        }
      });

      return unsubscribeGroup;
    };

    const fetchRequests = () => {
      const q = query(collection(db, "requests"), where("groupId", "==", groupId));
      const unsubscribeRequests = onSnapshot(q, (querySnapshot) => {
        setRequests(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      return unsubscribeRequests;
    };

    const fetchWorkplan = () => {
      const q = query(collection(db, "workplan"), where("groupId", "==", groupId));
      const unsubscribeWorkplan = onSnapshot(q, (querySnapshot) => {
        setWorkplan(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      return unsubscribeWorkplan;
    };

    const unsubscribeGroup = fetchGroup();
    const unsubscribeRequests = fetchRequests();
    const unsubscribeWorkplan = fetchWorkplan();

    return () => {
      unsubscribeGroup();
      unsubscribeRequests();
      unsubscribeWorkplan();
    };
  }, [groupId]);

  const handleSaveGroup = async (updatedGroup) => {
    const groupDocRef = doc(db, "groups", groupId);
    await updateDoc(groupDocRef, updatedGroup);
  };

  if (!group) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex flex-col items-start h-screen w-full p-10">
        <div className="flex justify-between w-full">
          <h1 className="text-4xl font-bold mb-2">{group.name}</h1>
          <div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-primary-color text-white p-2 rounded-sm text-sm hover:bg-opacity-80 transition mr-2 flex flex-row items-center gap-2"
            >
              <MdEdit className="text-sm" />
              Edit Group
            </button>
          </div>
        </div>
        <p className="text-sm italic">{group.description}</p>
        {group.imageUrl && <img src={group.imageUrl} alt={group.name} className="mt-2 w-full h-40 object-cover rounded-lg" />}
        <div className="mt-2 flex flex-row justify-between items-start w-full">
          {/* Members List */}
          <div>
            <h3 className="font-bold text-sm">Members:</h3>
            <ul className="text-sm">
              {group.members.map(member => (
                <li key={member.id}>
                  {member.name} {member.lastname} - {member.role}
                </li>
              ))}
            </ul>
            {portfolioManager && (
              <div className="mt-2">
                <h3 className="font-bold text-sm">Portfolio Manager:</h3>
                <p className="text-sm">{portfolioManager.name} {portfolioManager.lastname}</p>
              </div>
            )}
          </div>

          {/* Cards for workplan statistics */}
          <div className="flex gap-2">
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
                  (workplan.filter((task) => task.status === "Completed").length / workplan.length) * 100
                ) >= 75
                  ? "bg-green-500"
                  : Math.round(
                    (workplan.filter((task) => task.status === "Completed").length / workplan.length) * 100
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
                    (workplan.filter((task) => task.status === "Completed").length / workplan.length) * 100
                  )}%`
                  : "0%"}
              </p>
            </div>
          </div>
        </div>

        {/* Toggle Buttons for Requests and Workplan */}
        <div className="flex mt-4">
          <button
            onClick={() => {
              setIsRequestsTableOpen(true);
              setIsWorkplanTableOpen(false);
            }}
            className={`${isRequestsTableOpen
              ? "bg-primary-color text-white"
              : "bg-white border border-primary-color"
              } text-primary-color px-4 py-2 text-xs hover:bg-opacity-80 transition`}
          >
            Group Requests
          </button>
          <button
            onClick={() => {
              setIsWorkplanTableOpen(true);
              setIsRequestsTableOpen(false);
            }}
            className={`${isWorkplanTableOpen
              ? "bg-primary-color text-white"
              : "bg-white border border-primary-color"
              } text-primary-color px-4 py-2 text-xs hover:bg-opacity-80 transition`}
          >
            Workplan
          </button>
        </div>

        {/* Requests Table */}
        {isRequestsTableOpen && (
          <div className="overflow-y-auto h-96 mt-3 w-full">
            <table className="w-full bg-white border border-gray-200 text-xs text-center">
              <thead className="sticky top-0 bg-primary-color text-white">
                <tr>
                  <th className="py-2 px-4 border-b">Responsible Team Member</th>
                  <th className="py-2 px-4 border-b">Request Type</th>
                  <th className="py-2 px-4 border-b">Description</th>
                  <th className="py-2 px-4 border-b">Date Entry</th>
                  <th className="py-2 px-4 border-b">Date Needed</th>
                  <th className="py-2 px-4 border-b">Resource/Tool Needed</th>
                  <th className="py-2 px-4 border-b">Prospect Resource Person</th>
                  <th className="py-2 px-4 border-b">Priority Level</th>
                  <th className="py-2 px-4 border-b">Remarks</th>
                  <th className="py-2 px-4 border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.length > 0 ? (
                  requests.map(request => (
                    <tr key={request.id}>
                      <td className="py-2 px-4 border-b">{request.responsibleTeamMember}</td>
                      <td className="py-2 px-4 border-b">{request.requestType}</td>
                      <td className="py-2 px-4 border-b">{request.description}</td>
                      <td className="py-2 px-4 border-b">
                        {request.dateEntry
                          ? new Date(request.dateEntry.seconds * 1000).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {request.dateNeeded
                          ? new Date(request.dateNeeded).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b">{request.resourceToolNeeded}</td>
                      <td className="py-2 px-4 border-b">{request.prospectResourcePerson}</td>
                      <td className="py-2 px-4 border-b">{request.priorityLevel}</td>
                      <td className="py-2 px-4 border-b">{request.remarks}</td>
                      <td className="py-2 px-4 border-b">{request.status}</td>
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

        {/* Workplan Table */}
        {isWorkplanTableOpen && (
          <div className="overflow-y-auto h-96 mt-3 w-full">
            <table className="w-full bg-white border border-gray-200 text-xs text-center">
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
                        <td className="p-2 border-b text-left">{task.taskName}</td>
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
                          className={`p-2 border-b font-semibold ${task.status === "Pending"
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

      {/* Edit Modal */}
      <EditGroupModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        group={group}
        onSave={handleSaveGroup}
      />
    </div>
  );
}

export default AdViewGroups;