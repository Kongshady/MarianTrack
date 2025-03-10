import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../config/marian-config.js";
import { collection, getDocs } from "firebase/firestore";
import IncubateeSidebar from "../../components/IncubateeSidebar.jsx";

function IncuGroups() {
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Incubatee | My Group"; // Set the page title
  }, []);

  useEffect(() => {
    const fetchUserGroups = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const querySnapshot = await getDocs(collection(db, "groups"));
          const filteredGroups = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(group => group.members.some(member => member.email === user.email)); // Check if the user's email exists in the members array

          if (filteredGroups.length > 0) {
            // Automatically navigate to the first group found
            navigate(`/incubatee/view-group/${filteredGroups[0].id}`);
          } else {
            setGroups(filteredGroups);
          }
        } catch (error) {
          console.error("Error fetching user groups:", error);
        }
      }
    };

    fetchUserGroups();
  }, [navigate]);

  return (
    <div className="flex">
      <IncubateeSidebar />
      <div className="flex flex-col items-start h-screen w-full p-10">
        <h1 className="text-4xl font-bold mb-5">My Group</h1>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.length > 0 ? (
            groups.map(group => (
              <div key={group.id} className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-xl font-bold">{group.name}</h2>
                <p className="text-sm">{group.description}</p>
                {group.imageUrl && (
                  <img
                    src={group.imageUrl}
                    alt={group.name}
                    className="mt-2 w-full h-40 object-cover rounded-lg"
                  />
                )}
                <div className="mt-2">
                  <h3 className="font-bold text-sm">Members:</h3>
                  <ul className="text-sm">
                    {group.members.map((member, index) => (
                      <li key={index}>{member.email}</li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => navigate(`/incubatee/view-group/${group.id}`)}
                  className="mt-4 bg-secondary-color text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition"
                >
                  View Group
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">You are not assigned to any group.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default IncuGroups;