import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../config/marian-config.js";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import EmployeeSidebar from "../../components/sidebar/EmployeeSidebar.jsx";

function EmGroups() {
  const [groups, setGroups] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Employee | Groups"; // Set the page title
  }, []);

  useEffect(() => {
    let unsubscribe;
    const fetchGroups = async () => {
      try {
        let q;
        if (user.role === "TBI Manager") {
          q = query(collection(db, "groups"));
        } else if (user.role === "Portfolio Manager") {
          q = query(collection(db, "groups"), where("portfolioManager.id", "==", user.id));
        }

        if (q) {
          unsubscribe = onSnapshot(q, (querySnapshot) => {
            setGroups(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          });
        }
      } catch (error) {
        console.error("Error fetching user groups:", error);
      }
    };

    if (user) {
      fetchGroups();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const handleViewGroup = (groupId) => {
    navigate(`/employee/view-group/${groupId}`);
  };

  return (
    <div className="flex">
      <EmployeeSidebar onUserFetched={setUser} />
      <div className="flex flex-col items-start h-screen w-full p-10">
        <h1 className="text-4xl font-bold mb-5">Incubatees</h1>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.length > 0 ? (
            groups.map(group => (
              <div
                key={group.id}
                className="bg-white p-4 rounded-lg shadow-md border hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-md font-bold">{group.name}</h2>
                <p className="text-xs text-gray-600">{group.description}</p>
                {group.imageUrl && (
                  <img
                    src={group.imageUrl}
                    alt={group.name}
                    className="mt-2 w-full h-40 object-cover rounded-lg"
                  />
                )}
                <div className="mt-2">
                  <h3 className="font-bold text-sm">Members:</h3>
                  <div className="flex flex-col justify-start text-xs">
                    <ul className="flex-1">
                      {group.members.map((member) => (
                        <li key={member.id}>
                          {member.name} {member.lastname}
                        </li>
                      ))}
                    </ul>
                    {group.portfolioManager.id !== user.id && (
                      <div className="flex-1 mt-2">
                        <h3 className="font-bold text-sm">Assigned PM:</h3>
                        <p>
                          {group.portfolioManager.name} {group.portfolioManager.lastname}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleViewGroup(group.id)}
                    className="mt-4 bg-primary-color border border-primary-color text-white px-4 py-2 rounded-sm text-xs hover:bg-white hover:text-primary-color transition"
                  >
                    View Group
                  </button>
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