import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../config/marian-config.js";
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import EmployeeSidebar from "../../components/EmployeeSidebar.jsx";

function EmViewGroup() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [requests, setRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false); // State variable to manage table visibility

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
        setRequests(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    fetchGroup();
    fetchRequests();
  }, [groupId]);

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await updateDoc(doc(db, "requests", requestId), { status: newStatus });
      setRequests(prevRequests =>
        prevRequests.map(request =>
          request.id === requestId ? { ...request, status: newStatus } : request
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (!group) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex">
      <EmployeeSidebar />
      <div className="flex flex-col items-start h-screen w-full p-10">
        <h1 className="text-4xl font-bold mb-2">{group.name}</h1>
        <p className="text-sm">{group.description}</p>
        {group.imageUrl && <img src={group.imageUrl} alt={group.name} className="mt-2 w-full h-40 object-cover rounded-lg" />}
        <div className="mt-2">
          <h3 className="font-bold text-sm">Members:</h3>
          <ul className="text-sm">
            {group.members.map(member => (
              <li key={member.id}>{member.name} {member.lastname}</li>
            ))}
          </ul>
        </div>
        <div className="mt-6 w-full">
          <h3 className="text-2xl font-bold mb-1 text-md">Requests</h3>
          <button
            onClick={() => setShowRequests(!showRequests)}
            className="bg-primary-color text-white px-4 p-2 rounded-sm text-xs hover:bg-opacity-80 transition"
          >
            {showRequests ? "Hide Requests" : "Show Requests"}
          </button>
          {showRequests && (
            <div className="overflow-y-auto h-96 mt-1">
              <table className="min-w-full bg-white border border-gray-200 text-xs">
                <thead className="sticky top-0 bg-primary-color text-white">
                  <tr>
                    <th className="py-2 px-4 border-b">Responsible Team Member</th>
                    <th className="py-2 px-4 border-b">Description</th>
                    <th className="py-2 px-4 border-b">Technical Requirement</th>
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
                        <td className="py-2 px-4 border-b">{request.description}</td>
                        <td className="py-2 px-4 border-b">{request.technicalRequirement}</td>
                        <td className="py-2 px-4 border-b">{new Date(request.dateEntry.seconds * 1000).toLocaleDateString()}</td>
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
                      <td className="py-2 px-4 border-b text-center" colSpan="10">No requests found.</td>
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