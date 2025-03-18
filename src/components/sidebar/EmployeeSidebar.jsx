import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../config/marian-config.js";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { GiHamburgerMenu, GiProgression } from "react-icons/gi";
import { MdDashboard, MdGroups } from "react-icons/md";
import { IoMdNotifications, IoMdSettings } from "react-icons/io";
import { IoLogOutSharp, IoChatbox } from "react-icons/io5";

function EmSideBar({ onUserFetched }) {
  const [userName, setUserName] = useState("Loading...");
  const [userRole, setUserRole] = useState("Loading...");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = sessionStorage.getItem("currentUser");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUserName(`${userData.name} ${userData.lastname}`);
        setUserRole(userData.role);
        onUserFetched(userData);
      } else {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = { id: userDoc.id, ...userDoc.data() };
            sessionStorage.setItem("currentUser", JSON.stringify(userData));
            setUserName(`${userData.name} ${userData.lastname}`);
            setUserRole(userData.role);
            onUserFetched(userData);
          }
        }
      }
    };

    const handleAuthStateChanged = async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = { id: userDoc.id, ...userDoc.data() };
          sessionStorage.setItem("currentUser", JSON.stringify(userData));
          setUserName(`${userData.name} ${userData.lastname}`);
          setUserRole(userData.role);
          onUserFetched(userData);
        }
      } else {
        sessionStorage.removeItem("currentUser");
        setUserName("Loading...");
        setUserRole("Loading...");
        onUserFetched(null);
      }
    };

    fetchUserData();
    const unsubscribe = auth.onAuthStateChanged(handleAuthStateChanged);

    return () => unsubscribe();
  }, [onUserFetched]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      sessionStorage.removeItem("currentUser");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="group w-[4rem] hover:w-1/4 h-screen bg-primary-color overflow-hidden transition-all duration-300">
      <div className="flex gap-3 p-3 items-center">
        <GiHamburgerMenu className="text-5xl text-white" />
        <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
          <h1 className="text-base font-bold">{userName}</h1>
          <p className="text-sm">{userRole}</p>
        </div>
      </div>
      <nav className="mt-6">
        <ul className="space-y-1">
          <MenuItem to={"/employee-dashboard"} icon={<MdDashboard />} text="Dashboard" />
          <MenuItem to={"/employee-groups"} icon={<MdGroups />} text="Incubatees" />
          <MenuItem to={"/employee-progress"} icon={<GiProgression />} text="Progress" />
          <MenuItem to={"/employee-notification"} icon={<IoMdNotifications />} text="Notification" />
          <MenuItem to={"/employee-chat"} icon={<IoChatbox />} text="Chat" />
          <MenuItem to={""} icon={<IoMdSettings />} text="Settings" />
          <li>
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 p-4 w-full text-left hover:bg-white hover:text-primary-color cursor-pointer transition-all text-white"
            >
              <IoLogOutSharp className="text-2xl" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                LogOut
              </span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

function MenuItem({ to, icon, text }) {
  return (
    <li>
      <Link to={to} className="flex items-center gap-4 p-4 hover:bg-white hover:text-primary-color cursor-pointer transition-all text-white">
        <span className="text-2xl">{icon}</span>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">{text}</span>
      </Link>
    </li>
  );
}

export default EmSideBar;