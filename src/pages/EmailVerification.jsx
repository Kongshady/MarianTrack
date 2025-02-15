import MarianLogo from "../assets/images/MarianLogoWtext.png";
import CustomButton from "../components/CustomButton";

function EmailVerification() {
    return (
        <div>
            <div className="flex items-center justify-center h-screen">
                <div className="flex flex-col gap-3 p-10 w-1/3 bg-white rounded-md shadow-2xl">
                    <img src={MarianLogo} alt="MarianTBI-logo" className="w-28 p-2 mx-auto" />
                    <h1 className="text-2xl font-bold text-center">Please verify your email</h1>
                    <div className="text-center">
                        <p className="text-center">You're almost there! We sent an email to</p>
                        <span className="text-red-600">email address here</span>
                    </div>
                    <div>
                        <p className="text-center">Just click on the link in that email to complete your signup.</p>
                        <p className="text-center">If you dont see it, you may need to check your <b>spam</b> folder</p>
                    </div>
                    <CustomButton text={'Resend Email'} className={'bg-primary-color text-white hover:bg-white hover:text-primary-color transition-all'} />
                </div>
            </div>
        </div>
    );
}

export default EmailVerification