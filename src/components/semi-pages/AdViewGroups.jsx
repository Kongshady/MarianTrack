import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../config/marian-config.js";
import { doc, updateDoc, arrayUnion, arrayRemove, collection, deleteDoc, query, where, onSnapshot, getDoc } from "firebase/firestore";
import AdminSidebar from "../sidebar/AdminSidebar.jsx";
import EditGroupModal from "../modals/EditGroupModal.jsx";
import DeleteGroupModal from "../modals/DeleteGroupModal.jsx";
import { MdEdit } from "react-icons/md";

function AdViewGroups() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [agreeToDelete, setAgreeToDelete] = useState(false);
  const [requests, setRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const [portfolioManager, setPortfolioManager] = useState(null);

  useEffect(() => {
    const fetchGroup = () => {
      const groupDocRef = doc(db, "groups", groupId);
      const unsubscribeGroup = onSnapshot(groupDocRef, (doc) => {
        if (doc.exists()) {
          const groupData = doc.data();
          setGroup({ id: doc.id, ...groupData });
          setGroupName(groupData.name);
          setDescription(groupData.description);

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

    const fetchAvailableUsers = () => {
      const usersCollectionRef = collection(db, "users");
      const groupsCollectionRef = collection(db, "groups");

      const unsubscribeUsers = onSnapshot(usersCollectionRef, (usersSnapshot) => {
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        onSnapshot(groupsCollectionRef, (groupsSnapshot) => {
          const groups = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          const assignedUserIds = new Set();
          groups.forEach(group => {
            if (group.members) {
              group.members.forEach(member => assignedUserIds.add(member.id));
            }
          });

          const availableUsers = users.filter(user =>
            user.status === "approved" &&
            !assignedUserIds.has(user.id) &&
            user.role !== "TBI Manager" &&
            user.role !== "TBI Assistant" &&
            user.role !== "Portfolio Manager"
          );
          setAvailableUsers(availableUsers);
        });
      });

      return unsubscribeUsers;
    };

    const fetchRequests = () => {
      const q = query(collection(db, "requests"), where("groupId", "==", groupId));
      const unsubscribeRequests = onSnapshot(q, (querySnapshot) => {
        setRequests(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      return unsubscribeRequests;
    };

    const unsubscribeGroup = fetchGroup();
    const unsubscribeUsers = fetchAvailableUsers();
    const unsubscribeRequests = fetchRequests();

    return () => {
      unsubscribeGroup();
      unsubscribeUsers();
      unsubscribeRequests();
    };
  }, [groupId]);

  const handleAddMember = async () => {
    if (!selectedUser) return;

    try {
      const userDocRef = doc(db, "users", selectedUser);
      const userDoc = await getDoc(userDocRef);
      const userData = { id: selectedUser, ...userDoc.data() };

      await updateDoc(doc(db, "groups", groupId), {
        members: arrayUnion(userData)
      });

      setGroup(prevGroup => ({
        ...prevGroup,
        members: [...prevGroup.members, userData]
      }));

      setSelectedUser("");
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const memberToRemove = group.members.find(member => member.id === memberId);

      await updateDoc(doc(db, "groups", groupId), {
        members: arrayRemove(memberToRemove)
      });

      setGroup(prevGroup => ({
        ...prevGroup,
        members: prevGroup.members.filter(member => member.id !== memberId)
      }));
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const handleUpdateGroup = async () => {
    try {
      await updateDoc(doc(db, "groups", groupId), {
        name: groupName,
        description,
        members: group.members
      });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating group:", error);
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await deleteDoc(doc(db, "groups", groupId));
      setIsDeleteModalOpen(false);
      navigate("/admin-groups");
    } catch (error) {
      console.error("Error deleting group:", error);
    }
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
        <p className="text-sm">{group.description}</p>
        {group.imageUrl && <img src={group.imageUrl} alt={group.name} className="mt-2 w-full h-40 object-cover rounded-lg" />}
        <div className="mt-2">
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
        <div className="mt-6 w-full">
          <h3 className="text-2xl font-bold mb-1 text-md">Requests</h3>
          <div className="relative inline-block">
            <button
              onClick={() => setShowRequests(!showRequests)}
              className="bg-primary-color text-white px-4 p-2 rounded-sm text-xs hover:bg-opacity-80 transition"
            >
              {showRequests ? "Hide Requests" : "Show Requests"}
            </button>
            {requests.length > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                {requests.length}
              </span>
            )}
          </div>
          {showRequests && (
            <div className="overflow-y-auto h-96 mt-1">
              <table className="min-w-full bg-white border border-gray-200 text-xs text-center">
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
                        <td className="py-2 px-4 border-b">{request.dateEntry ? new Date(request.dateEntry.seconds * 1000).toLocaleDateString() : "N/A"}</td>
                        <td className="py-2 px-4 border-b">{request.dateNeeded}</td>
                        <td className="py-2 px-4 border-b">{request.resourceToolNeeded}</td>
                        <td className="py-2 px-4 border-b">{request.prospectResourcePerson}</td>
                        <td className="py-2 px-4 border-b">{request.priorityLevel}</td>
                        <td className="py-2 px-4 border-b">{request.remarks}</td>
                        <td className="py-2 px-4 border-b">{request.status}</td>
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

      <EditGroupModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onDelete={() => setIsDeleteModalOpen(true)}
        groupName={groupName}
        setGroupName={setGroupName}
        description={description}
        setDescription={setDescription}
        availableUsers={availableUsers}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        handleAddMember={handleAddMember}
        handleRemoveMember={handleRemoveMember}
        handleUpdateGroup={handleUpdateGroup}
        group={group}
      />

      <DeleteGroupModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteGroup}
        agreeToDelete={agreeToDelete}
        setAgreeToDelete={setAgreeToDelete}
      />
    </div>
  );
}

export default AdViewGroups;