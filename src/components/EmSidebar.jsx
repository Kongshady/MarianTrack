import { GiHamburgerMenu, GiProgression } from "react-icons/gi";
import { MdDashboard, MdGroups, MdManageAccounts } from "react-icons/md";
import { IoMdNotifications, IoMdSettings } from "react-icons/io";
import { IoLogOutSharp } from "react-icons/io5";

function EmSideBar() {
  return (
    <div className="group w-[4rem] hover:w-1/4 h-screen bg-primary-color overflow-hidden transition-all duration-300">
      {/* Logo & Menu Button */}
      <div className="flex gap-3 p-3 items-center">
        <GiHamburgerMenu className="text-5xl text-white" />
        <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
          <h1 className="text-base font-bold">Temporary Name Head</h1>
          <p className="text-sm">Role</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="">
        <ul className="space">
          <MenuItem icon={<MdDashboard />} text="Dashboard" />
          <MenuItem icon={<MdGroups />} text="Groups" />
          <MenuItem icon={<GiProgression />} text="Progress" />
          <MenuItem icon={<MdManageAccounts />} text="Account Approval" />
          <MenuItem icon={<IoMdNotifications />} text="Notification" />
          <MenuItem icon={<IoMdSettings />} text="Settings" />
          <MenuItem icon={<IoLogOutSharp />} text="Log Out" />
        </ul>
      </nav>
    </div>
  );
}

/* Reusable Menu Item Component */
function MenuItem({ icon, text }) {
  return (
    <li className="flex items-center gap-4 p-4 hover:bg-white hover:text-primary-color cursor-pointer transition-all text-white">
      <span className="text-2xl">{icon}</span>
      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {text}
      </span>
    </li>
  );
}

export default EmSideBar;
