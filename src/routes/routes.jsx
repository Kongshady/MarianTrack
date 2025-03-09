import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage.jsx";
import PasswordReset from "../pages/PasswordReset.jsx";
import CreateAccount from "../pages/CreateAccPage.jsx";
import WaitingForApproval from "../pages/WaitingForApproval.jsx";
// Incubatee Pages
import IncubateeCreateAccount from "../pages/incubatee/IncubateeCreateAccount.jsx";
import LogAsIncubatee from "../pages/incubatee/AsIncubatee.jsx";
import IncuDashboard from "../pages/incubatee/IncuDashboard.jsx";
import IncuGroups from "../pages/incubatee/IncuGroups.jsx";
import IncuNotifications from "../pages/incubatee/IncuNotifications.jsx";
import IncuChat from "../pages/incubatee/IncuChat.jsx";

import IncuViewGroup from "../components/semi-pages/IncuViewGroups.jsx";

// Employee Pages
import EmployeeCreateAccount from "../pages/employee/EmployeeCreateAccount.jsx";
import LogAsEmployee from "../pages/employee/AsEmployee.jsx";
import EmDashboard from "../pages/employee/EmDashboard.jsx";
import EmGroups from "../pages/employee/EmGroups.jsx";
import EmNotification from "../pages/employee/EmNotification.jsx";
import EmProgress from "../pages/employee/EmProgress.jsx";
import EmChat from "../pages/employee/EmChat.jsx";

import EmViewGroup from "../components/semi-pages/EmViewGroups.jsx";
// Admin Pages
import LogAsAdmin from "../pages/admin/AsAdmin.jsx";
import AdDashboard from "../pages/admin/AdDashboard.jsx";
import AdChat from "../pages/admin/AdChat.jsx";
import AdNotification from "../pages/admin/AdNotification.jsx";
import AdGroups from "../pages/admin/AdGroups.jsx";
import AdProgress from "../pages/admin/AdProgress.jsx";
import AdAccApproval from "../pages/admin/AdAccountApproval.jsx";

import AdViewGroups from "../components/semi-pages/AdViewGroups.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/password-reset" element={<PasswordReset />} />
      <Route path="/create-account" element={<CreateAccount />} />
      <Route path="/waiting-for-approval" element={<WaitingForApproval />} />

      {/* Incubatee Routes */}
      <Route path="/incubatee-login" element={<LogAsIncubatee />} />
      <Route path="/incubatee-create-account" element={<IncubateeCreateAccount />} />
      <Route path="/incubatee-dashboard" element={<IncuDashboard />} />
      <Route path="/incubatee-group" element={<IncuGroups />} />
      <Route path="/incubatee-notification" element={<IncuNotifications />} />
      <Route path="/incubatee-chat" element={<IncuChat />} />

      <Route path="/incubatee/view-group/:groupId" element={<IncuViewGroup />} />

      {/* Employee Routes */}
      <Route path="/employee-login" element={<LogAsEmployee />} />
      <Route path="/employee-create-account" element={<EmployeeCreateAccount />} />
      <Route path="/employee-dashboard" element={<EmDashboard />} />
      <Route path="/employee-groups" element={<EmGroups />} />
      <Route path="/employee-progress" element={<EmProgress />} />
      <Route path="/employee-notification" element={<EmNotification />} />
      <Route path="/employee-chat" element={<EmChat />} />

      <Route path="/employee/view-group/:groupId" element={<EmViewGroup />} />

      {/* Admin Routes */}
      <Route path="/admin-login" element={<LogAsAdmin />} />
      <Route path="/admin-dashboard" element={<AdDashboard />} />
      <Route path="/admin-groups" element={<AdGroups />} />
      <Route path="/admin-progress" element={<AdProgress />} />
      <Route path="/admin-approval" element={<AdAccApproval />} />
      <Route path="/admin-notification" element={<AdNotification />} />
      <Route path="/admin-chat" element={<AdChat />} />

      <Route path="/admin/view-group/:groupId" element={<AdViewGroups />} />
    </Routes>
  );
}

export default AppRoutes;
