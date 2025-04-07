import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "../config/marian-config.js";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async (user) => {
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

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      checkAuth(user);
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, [allowedRoles]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-svh">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  return isAuthorized ? children : <Navigate to="/" />;
};

export default ProtectedRoute;