import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../config/marian-config.js";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import IncubateeSidebar from "../../components/sidebar/IncubateeSidebar.jsx";

function IncuEditProfile() {
  const [userData, setUserData] = useState({
    name: "",
    lastname: "",
    email: "",
    mobile: "",
    role: "",
    facebook: "",
    github: "",
    linkedin: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Incubatee | Edit Profile"; // Set the page title

    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, "users", user.uid), userData);
        alert("Profile updated successfully!");
        navigate("/incubatee-dashboard");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    }
  };

  return (
    <div className="flex">
      <IncubateeSidebar />
      <div className="flex flex-col items-center justify-center h-screen w-full p-10 ">
        <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
        <form onSubmit={handleSubmit} className="w-full max-w-2xl p-8 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-sm">
              <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
              <div className="mb-2">
                <label className="block text-sm font-bold " htmlFor="name">
                  First Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold" htmlFor="lastname">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastname"
                  name="lastname"
                  value={userData.lastname}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold " htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-sm text-gray-400"
                  readOnly
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold " htmlFor="mobile">
                  Mobile
                </label>
                <input
                  type="text"
                  id="mobile"
                  name="mobile"
                  value={userData.mobile}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold " htmlFor="role">
                  Role
                </label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  value={userData.role}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-sm text-gray-400"
                  readOnly
                />
              </div>
            </div>
            <div className="text-sm">
              <h2 className="text-lg font-semibold mb-4">Social Media Links</h2>
              <div className="mb-2">
                <label className="block text-sm font-bold " htmlFor="facebook">
                  Facebook
                </label>
                <input
                  type="text"
                  id="facebook"
                  name="facebook"
                  value={userData.facebook}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold " htmlFor="github">
                  Github
                </label>
                <input
                  type="text"
                  id="github"
                  name="github"
                  value={userData.github}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-sm "
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold " htmlFor="linkedin">
                  LinkedIn
                </label>
                <input
                  type="text"
                  id="linkedin"
                  name="linkedin"
                  value={userData.linkedin}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-sm"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              className="px-6 py-2 bg-secondary-color text-white text-sm rounded-sm hover:bg-opacity-80 transition"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default IncuEditProfile;