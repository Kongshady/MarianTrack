import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/routes.jsx";
import LandingPage from "./pages/LandingPage.jsx";
// import LoginPage from "./pages/LoginPage.jsx";
// import CreateAccPage from "./pages/CreateAccPage.jsx";
// import SideBar from "./components/Sidebar.jsx";
// import EmDashboard from "./pages/employee/EmDashboard.jsx";
// import StDashboard from "./pages/student/StDashboard.jsx";
// import StDashboard from "./pages/PasswordReset.jsx";
// import EmailVerification from "./pages/EmailVerification.jsx";
// import { Router } from "react-router-dom";
// import EmGroups from "./pages/employee/EmGroups.jsx";

function App() {
  return(
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App

// LoginPage (Done)
// CreateAccountPage (Done)
// PasswordReset (Done)
// EmailVerification (Done)
// EmDashboard (Pending)
// EmGroups (Pending)
// EmProgress (Pending)
// EmAccountApproval (Pending)
// EmNotification (Pending)
// EmChat (Pending)
// Working Logout

// StDashboard (Pending)
// StGroups (Pending)
// Notifications (Pending)
// StChat (Pending)
// Working Logout