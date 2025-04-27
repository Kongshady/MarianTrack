import { Link, useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton.jsx";
import MarianTbiLogo from "../assets/images/MarianTbiLogo.png";
import { FiArrowLeft } from "react-icons/fi"; // Import back icon

function CreateAccPage() {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center h-screen relative">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)} // Navigate to the previous page
                className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 transition"
            >
                <FiArrowLeft size={24} />
            </button>

            <div className="flex flex-col gap-4 p-5 bg-white rounded-md shadow-md w-1/4">
                <img src={MarianTbiLogo} alt="MarianTbiLogo" className="w-20 mx-auto shadow p-3 rounded-full" />
                <h1 className="text-center text-md font-bold mb-3">Create an Account</h1>
                <div className="flex flex-col gap-2">
                    <Link to={"/employee-create-account"}>
                        <CustomButton
                            text={"For Employees"}
                            className={"bg-primary-color text-white hover:bg-white hover:text-primary-color transition-all w-full"}
                        />
                    </Link>
                    <p className="text-center text-sm">or</p>
                    <Link to={"/incubatee-create-account"}>
                        <CustomButton
                            text={"For Incubatees"}
                            className={"bg-secondary-color text-white hover:bg-white hover:text-secondary-color transition-all w-full"}
                        />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default CreateAccPage;