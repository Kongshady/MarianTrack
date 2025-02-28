import { Link } from "react-router-dom";
import { GiHamburgerMenu, GiProgression } from "react-icons/gi";
import { MdDashboard, MdGroups, MdManageAccounts } from "react-icons/md";
import { IoMdNotifications, IoMdSettings } from "react-icons/io";
import { IoLogOutSharp, IoChatbox } from "react-icons/io5";

function EmSideBar() {
  return (
    <div className="group w-[4rem] hover:w-1/4 h-screen bg-primary-color overflow-hidden transition-all duration-300">
      {/* Logo & Menu Button */}
      <div className="flex gap-3 p-3 items-center">
        <GiHamburgerMenu className="text-5xl text-white" />
        <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
          <h1 className="text-base font-bold">Employee Name Head</h1>
          <p className="text-sm">Role</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6">
        <ul className="space-y-1">
          <MenuItem to={"/employee-dashboard"} icon={<MdDashboard />} text="Dashboard" />
          <MenuItem to={"/employee-groups"} icon={<MdGroups />} text="Groups" />
          <MenuItem to={"/employee-progress"} icon={<GiProgression />} text="Progress" />
          <MenuItem to={"/employee-notification"} icon={<IoMdNotifications />} text="Notification" />
          <MenuItem to={"/employee-chat"} icon={<IoChatbox />} text="Chat" />
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
      <Link to={to} className="flex items-center gap-4 p-4 hover:bg-white hover:text-primary-color cursor-pointer transition-all text-white">
        <span className="text-2xl">{icon}</span>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {text}
        </span>
      </Link>
    </li>
  );
}

export default EmSideBar;
