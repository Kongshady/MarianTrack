import CustomButton from "../components/CustomButton";
import { MdLockReset } from "react-icons/md";

function PasswordReset() {
    return (
        <div className="flex items-center justify-center h-svh">
            <form action="" method="post" className="flex flex-col w-1/3 gap-2 p-12 bg-white rounded-md shadow-2xl">
                <MdLockReset className="w-20 h-20 mx-auto text-primary-color scale-150" />
                <div className="pb-3 pt-3">
                    <h1 className='text-center text-2xl font-bold'>Password Reset</h1>
                    <p className="text-center">Provide the email address associated with your account to recover your password.</p>
                </div>
                <input type="text" placeholder="Your email address" className="p-2 border text-center" />
                <CustomButton text={'Reset my Password'} className={'bg-primary-color text-white hover:bg-white hover:text-primary-color transition-all'} />
            </form>
        </div>
    )
}

export default PasswordReset