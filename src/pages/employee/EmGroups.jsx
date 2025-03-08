import { useState, useEffect } from "react";
import { db } from "../../config/marian-config.js";
import { collection, getDocs, query, where } from "firebase/firestore";
import EmployeeSidebar from "../../components/EmployeeSidebar.jsx";

function EmGroups() {
  const [groups, setGroups] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (user && user.role === "Portfolio Manager") {
      const fetchUserGroups = async () => {
        try {
          const q = query(collection(db, "groups"), where("portfolioManager.id", "==", user.id));
          const querySnapshot = await getDocs(q);
          setGroups(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
          console.error("Error fetching user groups:", error);
        }
      };
      fetchUserGroups();
    }
  }, [user]);

  return (
    <div className="flex">
      <EmployeeSidebar onUserFetched={setUser} />
      <div className="flex flex-col items-start h-screen w-full p-10">
        <h1 className="text-4xl font-bold mb-5">Assigned Groups</h1>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.length > 0 ? (
            groups.map(group => (
              <div key={group.id} className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-xl font-bold">{group.name}</h2>
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
              </div>
            ))
          ) : (
            <p className="text-gray-500">No groups assigned.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmGroups;