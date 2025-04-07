import { useEffect, useState } from "react";
import AdminSidebar from "../../components/sidebar/AdminSidebar.jsx";
import { db } from "../../config/marian-config.js";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FiRefreshCw, FiList, FiBarChart2 } from "react-icons/fi"; // Import icons for list and detailed views

function AdProgress() {
  const [groups, setGroups] = useState([]); // State to store group data
  const [flippedCards, setFlippedCards] = useState({}); // State to track flipped cards
  const [taskFilter, setTaskFilter] = useState({}); // State to track the selected filter for each card
  const [viewMode, setViewMode] = useState({}); // State to track view mode (list or detailed) for each card
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Admin | Progress";

    const fetchGroupsWithWorkplans = async () => {
      try {
        const groupsSnapshot = await getDocs(collection(db, "groups"));
        const groupsData = await Promise.all(
          groupsSnapshot.docs.map(async (doc) => {
            const group = { id: doc.id, ...doc.data() };

            const workplanQuery = query(
              collection(db, "workplan"),
              where("groupId", "==", group.id)
            );
            const workplanSnapshot = await getDocs(workplanQuery);
            const workplan = workplanSnapshot.docs.map((taskDoc) => ({
              id: taskDoc.id,
              ...taskDoc.data(),
            }));

            return { ...group, workplan: workplan || [] };
          })
        );

        setGroups(groupsData);
      } catch (error) {
        console.error("Error fetching groups and workplans:", error);
      }
    };

    fetchGroupsWithWorkplans();
  }, []);

  const calculateProgress = (workplan) => {
    if (!workplan || workplan.length === 0) return 0;
    const completedTasks = workplan.filter((task) => task.status === "Completed").length;
    return Math.round((completedTasks / workplan.length) * 100);
  };

  const toggleFlip = (groupId) => {
    setFlippedCards((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
    // Reset the task filter and view mode when flipping the card
    setTaskFilter((prev) => ({
      ...prev,
      [groupId]: "Completed", // Default to "Completed" when flipped
    }));
    setViewMode((prev) => ({
      ...prev,
      [groupId]: "list", // Default to list view
    }));
  };

  const toggleViewMode = (groupId) => {
    setViewMode((prev) => ({
      ...prev,
      [groupId]: prev[groupId] === "list" ? "detailed" : "list",
    }));
  };

  const handleFilterChange = (groupId, filter) => {
    setTaskFilter((prev) => ({
      ...prev,
      [groupId]: filter, // Update the filter for the specific group
    }));
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex flex-col items-start justify-start h-screen w-full p-10">
        <h1 className="text-4xl font-bold mb-5">Incubatees Total Progress</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2 w-full">
          {groups.map((group) => {
            const progress = calculateProgress(group.workplan);
            const isFlipped = flippedCards[group.id];
            const selectedFilter = taskFilter[group.id] || "Completed"; // Default to "Completed"
            const currentViewMode = viewMode[group.id] || "list"; // Default to list view

            const totalTasks = group.workplan.length;
            const completedTasks = group.workplan.filter((task) => task.status === "Completed").length;
            const pendingTasks = group.workplan.filter((task) => task.status === "Pending").length;

            return (
              <div
                key={group.id}
                className={`p-4 border rounded hover:shadow-lg transition bg-white flex flex-col justify-between items-center relative ${
                  isFlipped ? "flipped" : ""
                }`}
              >
                {/* Flip Button */}
                <button
                  onClick={() => toggleFlip(group.id)}
                  className="absolute top-2 right-2 text-gray-600 text-xs p-2 rounded-full hover:bg-gray-300"
                >
                  <FiRefreshCw size={16} />
                </button>

                {/* Front Side */}
                {!isFlipped && (
                  <>
                    <h2 className="text-md font-medium text-gray-800 text-center">{group.name}</h2>
                    <div className="flex items-center justify-center mt-4">
                      <div
                        className="relative flex items-center justify-center w-20 h-20 rounded-full border-4"
                        style={{
                          borderColor:
                            progress === 100
                              ? "green"
                              : progress >= 50
                              ? "yellow"
                              : "red",
                        }}
                      >
                        <span className="text-sm font-bold text-gray-800">{progress}%</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/admin/view-group/${group.id}`)}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white text-xs rounded-sm transition"
                    >
                      View Progress
                    </button>
                  </>
                )}

                {/* Back Side */}
                {isFlipped && (
                  <div className="text-center w-full">
                    {/* View Mode Toggle */}
                    <button
                      onClick={() => toggleViewMode(group.id)}
                      className="absolute top-2 left-2 text-gray-600 text-xs p-2 rounded-full hover:bg-gray-300"
                    >
                      {currentViewMode === "list" ? <FiBarChart2 size={16} title="Simple View" /> : <FiList size={16} title="Detailed View"/>}
                    </button>

                    {currentViewMode === "list" ? (
                      <>
                        <div className="mb-2">
                          <select
                            value={selectedFilter}
                            onChange={(e) => handleFilterChange(group.id, e.target.value)}
                            className="border rounded px-2 py-1 text-sm"
                          >
                            <option value="Completed">Completed Tasks</option>
                            <option value="Pending">Pending Tasks</option>
                          </select>
                        </div>
                        <div className="max-h-32 overflow-y-auto border-t pt-2">
                          {group.workplan.filter((task) => task.status === selectedFilter).length > 0 ? (
                            <ul className="text-sm text-left text-gray-600">
                              {group.workplan
                                .filter((task) => task.status === selectedFilter)
                                .map((task) => (
                                  <li key={task.id} className="mb-1">
                                    {task.taskName}
                                  </li>
                                ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500">No {selectedFilter.toLowerCase()} tasks.</p>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                        <div className="p-4 border rounded">
                          <p className="text-xs font-medium text-gray-800">Total Tasks</p>
                          <p className="text-lg font-bold text-gray-800">{totalTasks}</p>
                        </div>
                        <div className="p-4 border rounded">
                          <p className="text-xs font-medium text-green-600">Completed Tasks</p>
                          <p className="text-lg font-bold text-green-600">{completedTasks}</p>
                        </div>
                        <div className="p-4 border rounded">
                          <p className="text-xs font-medium text-red-600">Pending Tasks</p>
                          <p className="text-lg font-bold text-red-600">{pendingTasks}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AdProgress;