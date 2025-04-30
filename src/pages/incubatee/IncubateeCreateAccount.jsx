import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../config/marian-config.js"; // Import Firebase auth & Firestore
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import CustomButton from "../../components/CustomButton.jsx";
import { FiArrowLeft } from "react-icons/fi"; // Import back icon

function IncubateeCreateAccount() {
    const [name, setName] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Create an Account as Incubatee"; // Page title
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!name || !lastname || !email || !mobile || !password || !confirmPassword) {
            setError("All fields are required.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            // Firebase Authentication: Create User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Store User in Firestore
            await setDoc(doc(db, "users", user.uid), {
                name,
                lastname,
                email,
                mobile,
                role: "Incubatee", // Default role for all users created here
                status: "pending", // Default status for approval
                timestamp: serverTimestamp(),
            });

            alert("Account created successfully! Awaiting admin approval.");
            navigate("/waiting-for-approval"); // Redirect user to waiting page
        } catch (error) {
            setError(error.message);
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

            <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-5 bg-white rounded-md shadow-xl max-w-lg">
                <h1 className="text-center text-lg font-bold pb-3">Create Account as Incubatee</h1>

                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Name"
                        className="p-2 border w-full text-sm"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Lastname"
                        className="p-2 border w-full text-sm"
                        required
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                    />
                </div>

                <input
                    type="email"
                    placeholder="Email"
                    className="p-2 border text-sm"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Mobile Number"
                    maxLength={11}
                    className="p-2 border text-sm"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="p-2 border text-sm"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <ul className="text-xs text-gray-600 mt-1">
                    <li className={`${password.length >= 8 ? "text-green-500" : "text-red-500"}`}>
                        * Password must be at least 8 characters long
                    </li>
                    <li className={`${/[A-Z]/.test(password) ? "text-green-500" : "text-red-500"}`}>
                        * Must contain at least one uppercase letter
                    </li>
                    <li className={`${/[0-9]/.test(password) ? "text-green-500" : "text-red-500"}`}>
                        * Must contain at least one number
                    </li>
                </ul>
                <input
                    type="password"
                    placeholder="Confirm Password"
                    className="p-2 border text-sm"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {error && <p className="text-red-500 text-center">{error}</p>}

                <CustomButton
                    text={"Create Account"}
                    className={`px-4 py-2 text-white text-sm rounded-sm transition ${
                        !name ||
                        !lastname ||
                        !email ||
                        !mobile ||
                        !password ||
                        !confirmPassword ||
                        password !== confirmPassword ||
                        password.length < 8 ||
                        !/[a-z]/.test(password) ||
                        !/[0-9]/.test(password)
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-secondary-color hover:bg-opacity-80"
                    }`}
                    disabled={
                        !name ||
                        !lastname ||
                        !email ||
                        !mobile ||
                        !password ||
                        !confirmPassword ||
                        password !== confirmPassword ||
                        password.length < 8 ||
                        !/[a-z]/.test(password) ||
                        !/[0-9]/.test(password)
                    }
                />
            </form>
        </div>
    );
}

export default IncubateeCreateAccount;