import AuthLayout from "../components/layouts/AuthLayout";
import GoogleAuthButton from "../components/buttons/GoogleAuthButton";
import { useLoginWithOAuth } from "@privy-io/react-auth";
import { useNavigate } from "react-router-dom";

const AuthScreen = () => {
  const navigate = useNavigate();
  
  const { initOAuth } = useLoginWithOAuth({
    onComplete: () => {
      navigate("/books");
    },
    onError: (error) => {
      console.error("Login failed", error);
    },
  });

  const handleGoogleSignIn = async () => {
    try {
      await initOAuth({ provider: "google" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col justify-center items-center">
        <span className="text-2xl xl:text-3xl font-extrabold">Libere.</span>
        <p className="text-sm mt-2 text-dark-600">
          Libere Revolution Your Books, Your Rules, Your Rewards
        </p>
      </div>

      <div className="w-full mt-4 flex-col items-start">
        <div className="flex flex-col items-center">
          <GoogleAuthButton onClick={handleGoogleSignIn} />
        </div>
      </div>
    </AuthLayout>
  );
};

export default AuthScreen;
