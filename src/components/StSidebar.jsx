import { Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { MdDashboard, MdGroups } from "react-icons/md";
import { IoMdNotifications, IoMdSettings } from "react-icons/io";
import { IoLogOutSharp, IoChatbox  } from "react-icons/io5";

function StSideBar() {
  return (
    <div className="group w-[4rem] hover:w-1/4 h-screen bg-secondary-color overflow-hidden transition-all duration-300">
      {/* Logo & Menu Button */}
      <div className="flex gap-3 p-3 items-center">
        <GiHamburgerMenu className="text-5xl text-white" />
        <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
          <h1 className="text-base font-bold">Temporary Name Head</h1>
          <p className="text-sm">Role</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6">
        <ul className="space-y-1">
          <MenuItem to={"/student-dashboard"} icon={<MdDashboard />} text="Dashboard" />
          <MenuItem to={"/student-group"} icon={<MdGroups />} text="My Group" />
          <MenuItem to={"/student-notification"} icon={<IoMdNotifications />} text="Notifications" />
          <MenuItem to={"/student-chat"} icon={<IoChatbox />} text="Chats" />
          <MenuItem to={""} icon={<IoMdSettings />} text="Settings" />
          <MenuItem to={"/"} icon={<IoLogOutSharp />} text="LogOut" />
        </ul>
      </nav>
    </div>
  );
}

/* Reusable Menu Item Component */
function MenuItem({ to, icon, text }) {
  return (
    <li>
      <Link to={to} className="flex items-center gap-4 p-4 hover:bg-white hover:text-secondary-color cursor-pointer transition-all text-white">
        <span className="text-2xl">{icon}</span>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {text}
        </span>
      </Link>
    </li>
  );
}

export default StSideBar;
