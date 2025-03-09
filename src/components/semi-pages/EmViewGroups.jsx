import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../config/marian-config.js";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import EmployeeSidebar from "../../components/EmployeeSidebar.jsx";

function EmViewGroup() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [requests, setRequests] = useState([]);

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

  if (!group) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex">
      <EmployeeSidebar />
      <div className="flex flex-col items-start h-screen w-full p-10">
        <h1 className="text-4xl font-bold mb-5">{group.name}</h1>
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
          <h3 className="text-2xl font-bold mb-4">Requests</h3>
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-2 px-4 border-b text-center" colSpan="9">No requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EmViewGroup;