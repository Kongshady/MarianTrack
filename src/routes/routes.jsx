import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import PasswordReset from "../pages/PasswordReset.jsx";
import SignupPage from "../pages/SignUpPage.jsx";
import EmailVerification from "../pages/EmailVerification.jsx";
import StDashboard from "../pages/student/StDashboard.jsx";
import EmDashboard from "../pages/employee/EmDashboard.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/password-reset" element={<PasswordReset />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verification" element={<EmailVerification />} />
      <Route path="/student-dashboard" element={<StDashboard />} />
      <Route path="/employee-dashboard" element={<EmDashboard />} />
    </Routes>
  );
}

export default AppRoutes;
