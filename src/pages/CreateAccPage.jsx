import CustomButton from '../components/CustomButton.jsx'
import { useState } from "react"


function CreateAccPage() {
    return (
        <div className="flex items-center justify-center h-svh bg-gray-400">
            <form action="" method="post" className="flex flex-col gap-2 p-5 bg-white rounded-md shadow-2xl">
                <h1 className='text-center text-2xl font-bold pb-3'>Create Account</h1>
                <div className="flex gap-2">
                    <CustomInput type="text" placeholder="Name" className="border" />
                    <CustomInput type="text" placeholder="Lastname" className="border" />
                </div>
                <Dropdown className={'border'}/>
                <input type="text" placeholder="Mobile Number" maxLength={11} className="p-2 border" />
                <input type="password" placeholder="Password" className="p-2 border" />
                <input type="password" placeholder="Confirm Password" className="p-2 border" />
                <CustomButton text={'Create Account'} className={'bg-primary-color text-white'} />
            </form>
        </div>
    );
}

// Customized Inputs
function CustomInput({ placeholder, className }) {
    return (
        <input type="text" placeholder={`${placeholder}`} className={`p-2 ${className}`} />

    );
}

function Dropdown({ setRole, className }) {
    const [isOpen, setIsOpen] = useState(false);
    const roles = ["Project Development Officer", "Portfolio Manager", "Project Manager", "System Analyst", "Developer / Programmer"];

    return (
        <div className="relative">
            {/* Dropdown Button */}
            <button 
                type="button" 
                className={`p-2 bg-white w-full text-left text-gray-400 ${className}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                Choose Role
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <ul className="absolute left-0 mt-1 w-full bg-white shadow-md rounded-md">
                    {roles.map((role, index) => (
                        <li 
                            key={index} 
                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                            onClick={() => {
                                setRole(role); // ✅ Set selected role
                                setIsOpen(false); // ✅ Close dropdown after selection
                            }}
                        >
                            {role}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}


export default CreateAccPage;
