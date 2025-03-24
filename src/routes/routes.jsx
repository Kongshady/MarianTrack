import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage.jsx";
import PasswordReset from "../pages/PasswordReset.jsx";
import CreateAccount from "../pages/CreateAccPage.jsx";
import WaitingForApproval from "../pages/WaitingForApproval.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

// Incubatee Pages
import IncubateeCreateAccount from "../pages/incubatee/IncubateeCreateAccount.jsx";
import LogAsIncubatee from "../pages/incubatee/AsIncubatee.jsx";
import IncuDashboard from "../pages/incubatee/IncuDashboard.jsx";
import IncuGroups from "../pages/incubatee/IncuGroups.jsx";
import IncuNotifications from "../pages/incubatee/IncuNotifications.jsx";
import IncuChat from "../pages/incubatee/IncuChat.jsx";
import IncuViewGroup from "../components/semi-pages/IncuViewGroups.jsx";
import IncuEditProfile from "../components/edit-profile/IncuEditProfile.jsx";

// Employee Pages
import EmployeeCreateAccount from "../pages/employee/EmployeeCreateAccount.jsx";
import LogAsEmployee from "../pages/employee/AsEmployee.jsx";
import EmDashboard from "../pages/employee/EmDashboard.jsx";
import EmGroups from "../pages/employee/EmGroups.jsx";
import EmNotification from "../pages/employee/EmNotification.jsx";
import EmProgress from "../pages/employee/EmProgress.jsx";
import EmChat from "../pages/employee/EmChat.jsx";
import EmViewGroup from "../components/semi-pages/EmViewGroups.jsx";
import EmEditProfile from "../components/edit-profile/EmEditProfile.jsx";


// Admin Pages
import LogAsAdmin from "../pages/admin/AsAdmin.jsx";
import AdDashboard from "../pages/admin/AdDashboard.jsx";
import AdChat from "../pages/admin/AdChat.jsx";
import AdNotification from "../pages/admin/AdNotification.jsx";
import AdGroups from "../pages/admin/AdGroups.jsx";
import AdProgress from "../pages/admin/AdProgress.jsx";
import AdAccApproval from "../pages/admin/AdAccountApproval.jsx";
import AdViewGroups from "../components/semi-pages/AdViewGroups.jsx";
import AdEditProfile from "../components/edit-profile/AdEditProfile.jsx";
import AdArchives from "../pages/admin/AdArchives.jsx";


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
      <Route
        path="/incubatee-dashboard"
        element={
          <ProtectedRoute allowedRoles={["Project Manager", "System Analyst", "Developer"]}>
            <IncuDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/incubatee-group"
        element={
          <ProtectedRoute allowedRoles={["Project Manager", "System Analyst", "Developer"]}>
            <IncuGroups />
          </ProtectedRoute>
        }
      />
      <Route
        path="/incubatee-notification"
        element={
          <ProtectedRoute allowedRoles={["Project Manager", "System Analyst", "Developer"]}>
            <IncuNotifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/incubatee-chat"
        element={
          <ProtectedRoute allowedRoles={["Project Manager", "System Analyst", "Developer"]}>
            <IncuChat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/incubatee/view-group/:groupId"
        element={
          <ProtectedRoute allowedRoles={["Project Manager", "System Analyst", "Developer"]}>
            <IncuViewGroup />
          </ProtectedRoute>
        }
      />
      <Route
        path="/incubatee-editprofile"
        element={
          <ProtectedRoute allowedRoles={["Project Manager", "System Analyst", "Developer"]}>
            <IncuEditProfile />
          </ProtectedRoute>
        }
      />


      {/* Employee Routes */}
      <Route path="/employee-login" element={<LogAsEmployee />} />
      <Route path="/employee-create-account" element={<EmployeeCreateAccount />} />
      <Route
        path="/employee-dashboard"
        element={
          <ProtectedRoute allowedRoles={["TBI Manager", "Portfolio Manager", "TBI Assistant"]}>
            <EmDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee-groups"
        element={
          <ProtectedRoute allowedRoles={["TBI Manager", "Portfolio Manager", "TBI Assistant"]}>
            <EmGroups />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee-progress"
        element={
          <ProtectedRoute allowedRoles={["TBI Manager", "Portfolio Manager", "TBI Assistant"]}>
            <EmProgress />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee-notification"
        element={
          <ProtectedRoute allowedRoles={["TBI Manager", "Portfolio Manager", "TBI Assistant"]}>
            <EmNotification />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee-chat"
        element={
          <ProtectedRoute allowedRoles={["TBI Manager", "Portfolio Manager", "TBI Assistant"]}>
            <EmChat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/view-group/:groupId"
        element={
          <ProtectedRoute allowedRoles={["TBI Manager", "Portfolio Manager", "TBI Assistant"]}>
            <EmViewGroup />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee-editprofile"
        element={
          <ProtectedRoute allowedRoles={["TBI Manager", "Portfolio Manager", "TBI Assistant"]}>
            <EmEditProfile />
          </ProtectedRoute>
        }
      />


      {/* Admin Routes */}
      <Route path="/admin-login" element={<LogAsAdmin />} />
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={["TBI Manager", "TBI Assistant"]}>
            <AdDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-groups"
        element={
          <ProtectedRoute allowedRoles={["TBI Manager", "TBI Assistant"]}>
            <AdGroups />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-progress"
        element={
          <ProtectedRoute allowedRoles={["TBI Manager", "TBI Assistant"]}>
            <AdProgress />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-approval"
        element={
          <ProtectedRoute allowedRoles={["TBI Manager"]}>
            <AdAccApproval />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-notification"
        element={
          <ProtectedRoute allowedRoles={["TBI Manager", "TBI Assistant"]}>
            <AdNotification />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-chat"
        element={
          <ProtectedRoute allowedRoles={["TBI Manager", "TBI Assistant"]}>
            <AdChat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/view-group/:groupId"
        element={
          <ProtectedRoute allowedRoles={["TBI Manager", "TBI Assistant"]}>
            <AdViewGroups />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-editprofile"
        element={
          <ProtectedRoute allowedRoles={["TBI Manager", "TBI Assistant"]}>
            <AdEditProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-groups/archives"
        element={
          <ProtectedRoute allowedRoles={["TBI Manager", "TBI Assistant"]}>
            <AdArchives />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;