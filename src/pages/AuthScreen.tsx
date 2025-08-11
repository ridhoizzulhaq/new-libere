import AuthLayout from "../components/layouts/AuthLayout";
import GoogleAuthButton from "../components/buttons/GoogleAuthButton";
import { useLoginWithOAuth } from "@privy-io/react-auth";
import { useNavigate } from "react-router-dom";

const AuthScreen = () => {
  const navigate = useNavigate();
  
  const { initOAuth } = useLoginWithOAuth({
    onComplete: ({ user, isNewUser }) => {
      console.log("User logged in successfully", user);
      if (isNewUser) {
        // Perform actions for new users
      }

      navigate("/libraries");
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
        <p className="text-sm mt-2 text-zinc-600">
          Lorem ipsum, dolor sit amet consectetur adipisicing elit.
        </p>
      </div>

      <div className="w-full mt-4 flex-col items-start">
        <div className="flex flex-col items-center">
          <GoogleAuthButton onClick={handleGoogleSignIn} />

          <div className="mx-auto max-w-xs">
            <p className="mt-6 text-xs text-gray-600 text-center">
              I agree to abide by templatana's
              <a href="#" className="border-b border-gray-500 border-dotted">
                Terms of Service
              </a>{" "}
              and its{" "}
              <a href="#" className="border-b border-gray-500 border-dotted">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default AuthScreen;
