import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "../config/marian-config.js";
import { doc, getDoc } from "firebase/firestore";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.currentUser;
      if (user) {
        console.log("User is authenticated:", user);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("User data:", userData);
          if (userData.status === "approved" && allowedRoles.includes(userData.role)) {
            setIsAuthorized(true);
          } else {
            console.log("User is not authorized:", userData);
          }
        } else {
          console.log("User document does not exist");
        }
      } else {
        console.log("User is not authenticated");
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [allowedRoles]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthorized ? children : <Navigate to="/" />;
};

export default ProtectedRoute;