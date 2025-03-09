import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../config/marian-config.js";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import CustomButton from "../components/CustomButton.jsx";
import MarianLogo from "../assets/images/MarianLogoWtext.png";
import { FcGoogle } from "react-icons/fc";

function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "MarianTBI | Home"; // Set the page title
  }, []);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check user status and role in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.status === "approved") {
          navigate("/dashboard");
        } else {
          alert("Your account is pending approval.");
        }
      } else {
        alert("User not found. Please contact admin.");
      }
    } catch (error) {
      alert("Google Sign-In failed. Try again.");
    }
  };

  return (
    <div className="flex flex-row-reverse h-screen">
      {/* Left Section - Login Buttons */}
      <div className="flex flex-col w-1/2 gap-6 items-center justify-center p-10">
        <img src={MarianLogo} alt="MarianTBI-logo" className="w-28 p-2" />

        {/* Login Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link to={"/employee-login"}>
            <CustomButton text="Login as Employee" className="bg-primary-color text-text-color hover:bg-white hover:text-primary-color transition-all w-full" />
          </Link>
          <Link to={"/incubatee-login"}>
            <CustomButton text="Login as Incubatee" className="bg-secondary-color text-text-color hover:bg-white hover:text-secondary-color transition-all w-full" />
          </Link>
          <TextDivider />
          <button onClick={handleGoogleSignIn} className="flex items-center justify-center gap-2 w-full bg-white p-3 border-2 rounded cursor-pointer transition hover:scale-105">
            <FcGoogle className="w-6 h-6" />
            <span className="text-gray-600">Sign in with Google</span>
          </button>
        </div>

        {/* Create Account Link */}
        <Link to="/create-account" className="text-blue-600 hover:underline">
          Create Account
        </Link>
      </div>

      {/* Right Section - Greetings */}
      <div className="relative w-1/2 flex flex-col justify-center gap-5 p-10 text-text-color bg-banner-img bg-cover bg-center bg-no-repeat">
        {/* Dark Overlay for Better Readability */}
        <div className="absolute inset-0 bg-black opacity-40"></div>

        <div className="relative z-10">
          <h1 className="text-lg font-semibold">University of the Immaculate Conception</h1>

          <div>
            <h1 className="text-7xl font-bold">MARIAN</h1>
            <h2 className="text-4xl font-bold">Technology</h2>
            <h2 className="text-4xl font-bold">Business</h2>
            <h2 className="text-4xl font-bold">Incubator</h2>
          </div>

          <p className="text-sm leading-relaxed">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque
            dolores iure odio numquam aliquam recusandae fuga impedit, eius totam
            perspiciatis modi placeat mollitia, officiis vel ut rerum debitis
            exercitationem? Dolore.
          </p>
        </div>
      </div>
    </div>
  );
}

/* Divider Component */
function TextDivider() {
  return (
    <div className="flex items-center w-full">
      <div className="flex-grow border-t border-gray-400"></div>
      <span className="mx-4 text-gray-600">Or</span>
      <div className="flex-grow border-t border-gray-400"></div>
    </div>
  );
}

export default LandingPage;
