import AuthLayout from "../components/layouts/AuthLayout";
import GoogleAuthButton from "../components/buttons/GoogleAuthButton";

const AuthScreen = () => {
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
          <GoogleAuthButton />

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
