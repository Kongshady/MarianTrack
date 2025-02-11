import CustomButton from "../components/CustomButton.jsx";
import TextDivider from "../components/TextDivider.jsx";
import MarianLogo from "../assets/images/MarianLogoWtext.png";
import { FcGoogle } from "react-icons/fc";

function LoginPage() {
  return (
    <div className="flex flex-row">
      {/* Login Buttons */}
      <div className="flex flex-col w-1/2 gap-2 h-svh items-center justify-around p-10">
        <img src={MarianLogo} alt="MarianTBI-logo" className="w-28 p-2" />

        <div className="flex flex-col gap-2">
          <CustomButton
            text={"Login as Employee"}
            className={"bg-primary-color text-text-color"}
          ></CustomButton>
          <CustomButton
            text={"Login as Student"}
            className={"bg-secondary-color text-text-color"}
          ></CustomButton>
          <TextDivider></TextDivider>
          <FcGoogle className="w-12 h-12 self-center bg-white p-2 border-2 rounded cursor-pointer" />
        </div>

        <a href="#" className="text-blue-600">
          Create Account {/* Temporary solution */}
        </a>
      </div>

      {/* Greetings */}
      <div className="bg-banner-img h-svh p-10 flex flex-col gap-5 justify-center bg-cover bg-center bg-no-repeat text-text-color">
        <h1>University of the Immaculate Conception</h1>

        <div>
          <h1 className="text-7xl font-bold">MARIAN</h1>
          <h2 className="text-4xl font-bold">Technology</h2>
          <h2 className="text-4xl font-bold">Bussiness</h2>
          <h2 className="text-4xl font-bold">Incubator</h2>
        </div>

        <p>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Itaque
          dolores iure odio numquam aliquam recusandae fuga impedit, eius totam
          perspiciatis modi placeat mollitia, officiis vel ut rerum debitis
          exercitationem? Dolore.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
