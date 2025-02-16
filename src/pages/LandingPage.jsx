import CustomButton from "../components/CustomButton.jsx";
import MarianLogo from "../assets/images/MarianLogoWtext.png";
import { FcGoogle } from "react-icons/fc";

function LoginPage() {
  return (
    <div className="flex h-screen">
      {/* Left Section - Login Buttons */}
      <div className="flex flex-col w-1/2 gap-6 items-center justify-center p-10">
        <img src={MarianLogo} alt="MarianTBI-logo" className="w-28 p-2" />

        {/* Login Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <CustomButton text="Login as Employee" className="bg-primary-color text-text-color hover:bg-white hover:text-primary-color transition-all" />
          <CustomButton text="Login as Student" className="bg-secondary-color text-text-color hover:bg-white hover:text-secondary-color transition-all" />
          <TextDivider />
          <FcGoogle className="w-12 h-12 mx-auto bg-white p-2 border-2 rounded cursor-pointer transition hover:scale-105" />
        </div>

        {/* Create Account Link */}
        <a href="#" className="text-blue-600 hover:underline">
          Create Account
        </a>
      </div>

      {/* Right Section - Greetings */}
      <div className="bg-banner-img w-1/2 flex flex-col justify-center gap-5 p-10 bg-cover bg-center bg-no-repeat text-text-color">
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

export default LoginPage;
