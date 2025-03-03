import { Link } from "react-router-dom";
import MarianLogo from "../assets/images/MarianLogoWtext.png";
import CustomButton from "../components/CustomButton";

function WaitingForApproval() {
    return (
        <div>
            <div className="flex items-center justify-center h-screen">
                <div className="flex flex-col gap-3 p-10 w-1/3 bg-white rounded-md shadow-2xl">
                    <img src={MarianLogo} alt="MarianTBI-logo" className="w-28 p-2 mx-auto" />
                    <h1 className="text-2xl font-bold text-center">Approval in Progress, Please Wait</h1>
                    <p className="text-center">Your Request is pending. You may reach out to the TBI Manager for approval.</p>
                    <div className="w-full flex justify-center items-center">
                        <Link to={"/"}>
                            <CustomButton text={'Got it'} className={'bg-primary-color text-white hover:bg-white hover:text-primary-color transition-all'} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WaitingForApproval