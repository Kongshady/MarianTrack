import { useState, useEffect, useRef } from "react";
import CustomButton from "../components/CustomButton.jsx";

function CreateAccPage() {
    const [role, setRole] = useState(""); // Store selected role

    return (
        <div className="flex items-center justify-center h-svh">
            <form action="" method="post" className="flex flex-col gap-2 p-5 bg-white rounded-md shadow-2xl">
                <h1 className="text-center text-2xl font-bold pb-3">Create an Account</h1>

                {/* Name Fields */}
                <div className="flex gap-2">
                    <input type="text" placeholder="Name" className="p-2 border" required/>
                    <input type="text" placeholder="Lastname" className="p-2 border" required/>
                </div>

                {/* Dropdown for Role Selection */}
                <Dropdown setRole={setRole} role={role} className="border" />

                {/* Other Inputs */}
                <input type="text" placeholder="Mobile Number" maxLength={11} className="p-2 border" />
                <input type="password" placeholder="Password" className="p-2 border" />
                <input type="password" placeholder="Confirm Password" className="p-2 border" />

                <CustomButton text={"Create Account"} className={"bg-primary-color text-white hover:bg-white hover:text-primary-color transition-all"} />
            </form>
        </div>
    );
}

function Dropdown({ setRole, role, className }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const roles = [
        "Project Development Officer",
        "Portfolio Manager",
        "Project Manager",
        "System Analyst",
        "Developer / Programmer"
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Dropdown Button */}
            <button
                type="button"
                className={`p-2 bg-white w-full text-left ${className} ${role ? "text-black" : "text-gray-400"}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {role || "Choose Role"}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <ul className="absolute left-0 mt-1 w-full bg-white shadow-md rounded-md z-10">
                    {roles.map((item, index) => (
                        <li
                            key={index}
                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer transition"
                            onClick={() => {
                                setRole(item); // ✅ Set selected role
                                setIsOpen(false); // ✅ Close dropdown
                            }}
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default CreateAccPage;
