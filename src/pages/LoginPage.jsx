import CustomButton from '../components/CustomButton.jsx'

function LoginPage(){
    return(
        <div className="flex flex-col ">
            <CustomButton text={'Login as Employee'}></CustomButton>
            <CustomButton text={'Login as Student'}></CustomButton>
        </div>
    );
}

export default LoginPage