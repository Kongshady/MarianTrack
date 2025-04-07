import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../config/marian-config"; // Import Firebase auth
import CustomButton from "../components/CustomButton";
import { MdLockReset } from "react-icons/md";
import { FiArrowLeft } from "react-icons/fi"; // Import back icon
import { useNavigate } from "react-router-dom";

function PasswordReset() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!email) {
            setError("Please enter your email address.");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("Password reset email sent! Redirecting to the landing page...");
            setTimeout(() => {
                navigate("/"); // Redirect to the landing page after 3 seconds
            }, 3000);
        } catch (err) {
            setError("Failed to send password reset email. Please try again.");
        }
    };

    return (
        <div className="flex items-center justify-center h-screen relative">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)} // Navigate to the previous page
                className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 transition"
            >
                <FiArrowLeft size={24} />
            </button>

            <form
                onSubmit={handlePasswordReset}
                className="flex flex-col w-1/3 gap-2 p-12 bg-white rounded-md shadow-2xl"
            >
                <MdLockReset className="w-20 h-20 mx-auto text-primary-color scale-150" />
                <div className="pb-3 pt-3">
                    <h1 className="text-center text-2xl font-bold">Password Reset</h1>
                    <p className="text-center text-sm">
                        Provide the email address associated with your account to recover your password.
                    </p>
                </div>
                <input
                    type="email"
                    placeholder="Your email address"
                    className="p-2 border text-center text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {message && <p className="text-green-500 text-center text-sm">{message}</p>}
                {error && <p className="text-red-500 text-center text-sm">{error}</p>}
                <CustomButton
                    text={"Reset my Password"}
                    className={
                        "bg-primary-color text-white hover:bg-white hover:text-primary-color transition-all"
                    }
                />
            </form>
        </div>
    );
}

export default PasswordReset;