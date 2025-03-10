import { Link } from "react-router-dom";
import CustomButton from "../components/CustomButton.jsx";
import MarianTbiLogo from "../assets/images/MarianTbiLogo.png";

function CreateAccPage() {

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col gap-4 p-5 bg-white rounded-md shadow-md max-w-lg">
                <img src={MarianTbiLogo} alt="MarianTbiLogo" className="w-20 mx-auto shadow p-3 rounded-full" />
                <h1 className="text-center text-2xl font-bold">Create an Account</h1>
                <div className="flex flex-row gap-4">
                    <Link to={"/employee-create-account"}>
                        <CustomButton
                            text={"For Employees"}
                            className={"bg-primary-color text-white hover:bg-white hover:text-primary-color transition-all"}
                        />
                    </Link>

                    <Link to={"/incubatee-create-account"}>
                        <CustomButton
                            text={"For Incubatees"}
                            className={"bg-secondary-color text-white hover:bg-white hover:text-primary-color transition-all"}
                        />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default CreateAccPage;