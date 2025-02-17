import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import PasswordReset from "../pages/PasswordReset.jsx";
import SignupPage from "../pages/SignUpPage.jsx";
import EmailVerification from "../pages/EmailVerification.jsx";
// Student Pages
import StDashboard from "../pages/student/StDashboard.jsx";
import StGroups from "../pages/student/StGroups.jsx";
import StNotifications from "../pages/student/StNotifications.jsx";
import StChat from "../pages/student/StChat.jsx";
// Employee Pages
import EmDashboard from "../pages/employee/EmDashboard.jsx";
import EmGroups from "../pages/employee/EmGroups.jsx";
import EmNotification from "../pages/employee/EmNotification.jsx";
import EmProgress from "../pages/employee/EmProgress.jsx";
import EmChat from "../pages/employee/EmChat.jsx";
import EmAccApproval from "../pages/employee/EmAccApproval.jsx";



function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/password-reset" element={<PasswordReset />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verification" element={<EmailVerification />} />

      {/* Student Routes */}
      <Route path="/student-dashboard" element={<StDashboard />} />
      <Route path="/student-group" element={<StGroups />} />
      <Route path="/student-notification" element={<StNotifications />} />
      <Route path="/student-chat" element={<StChat />} />

      {/* Employee Routes */}
      <Route path="/employee-dashboard" element={<EmDashboard />} />
      <Route path="/employee-groups" element={<EmGroups />} />
      <Route path="/employee-progress" element={<EmProgress />} />
      <Route path="/employee-approval" element={<EmAccApproval />} />
      <Route path="/employee-notification" element={<EmNotification />} />
      <Route path="/employee-chat" element={<EmChat />} />
    </Routes>
  );
}

export default AppRoutes;
