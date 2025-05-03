import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminSideBar from "../../components/sidebar/AdminSidebar.jsx";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../config/marian-config.js";
import { IoArchiveOutline } from "react-icons/io5"; // Import the unarchive icon

function AdArchives() {
  const [archivedGroups, setArchivedGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    document.title = "Admin | Archives"; // Set the page title

    const fetchArchivedGroups = async () => {
      try {
        const q = query(collection(db, "groups"), where("archived", "==", true));
        const querySnapshot = await getDocs(q);
        const archivedGroupsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setArchivedGroups(archivedGroupsData);
        setFilteredGroups(archivedGroupsData);
      } catch (error) {
        console.error("Error fetching archived groups:", error);
      }
    };

    fetchArchivedGroups();
  }, []);

  useEffect(() => {
    filterGroups();
  }, [searchTerm, selectedYear, archivedGroups]);

  const handleUnarchiveGroup = async (groupId) => {
    try {
      await updateDoc(doc(db, "groups", groupId), { archived: false });
      setArchivedGroups(archivedGroups.filter(group => group.id !== groupId));
      alert("Group unarchived successfully!");
    } catch (error) {
      console.error("Error unarchiving group:", error);
      alert("Error unarchiving group. Please try again.");
    }
  };

  const filterGroups = () => {
    let filtered = archivedGroups;

    if (searchTerm) {
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchTerm.toLowerCase()) // Include description in the search
      );
    }

    if (selectedYear) {
      filtered = filtered.filter(group => {
        const createdAt = group.createdAt?.toDate();
        return createdAt && createdAt.getFullYear().toString() === selectedYear;
      });
    }

    setFilteredGroups(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const getYears = () => {
    const years = new Set();
    archivedGroups.forEach(group => {
      const createdAt = group.createdAt?.toDate();
      if (createdAt) {
        years.add(createdAt.getFullYear().toString());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  };

  return (
    <div className="flex">
      <AdminSideBar />
      <div className="flex flex-col items-start justify-start h-screen w-full p-10">
        <div className="flex justify-between items-center w-full mb-5">
          {/* Make "Incubatees" clickable and redirect to the previous page */}
          <h1 className="text-4xl">
            <button
              onClick={() => navigate(-2)} // Navigate to the previous page
              className="text-black hover:text-primary-color transition"
            >
              Incubatees
            </button>{" "}
            &gt; <b>Archived Groups</b>
          </h1>
          <div className="flex gap-2">
            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="p-2 border rounded text-sm"
            >
              <option value="">All Years</option>
              {getYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search Groups"
              className="p-2 border rounded text-sm"
            />
          </div>
        </div>
        <div className="mt-5 w-full overflow-y-auto">
          <div className="border-r-2 border-l-2"> {/* Added shadow and padding to the container */}
            <ul>
              {filteredGroups.map((group, index) => (
                <li
                  key={group.id}
                  className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-100 transition ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  {/* Image Placeholder */}
                  <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                    {group.imageUrl ? (
                      <img
                        src={group.imageUrl}
                        alt={group.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500 text-xs text-center">No Image</span>
                    )}
                  </div>

                  {/* Group Details */}
                  <Link to={`/admin/view-group/${group.id}`} className="flex-1">
                    <div>
                      <h2 className="text-sm font-bold">{group.name}</h2>
                      <p className="text-xs">{group.description}</p>
                    </div>
                  </Link>

                  {/* Unarchive Button */}
                  <button
                    onClick={() => handleUnarchiveGroup(group.id)}
                    className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                    title="Unarchive Group"
                  >
                    <IoArchiveOutline />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdArchives;