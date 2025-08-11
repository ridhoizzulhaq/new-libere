import React from "react";
import GoogleIcon from "../../assets/icons/GoogleIcon";

interface GoogleAuthButtonProps {
  onClick?: () => void;
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({onClick}) => {
  return (
    <button
      onClick={onClick}
      className="w-full max-w-xs font-bold shadow-sm rounded-lg py-3 bg-gray-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline"
    >
      <div className="bg-white p-2 rounded-full">
        <GoogleIcon size={16} />
      </div>
      <span className="ml-4">Sign Up with Google</span>
    </button>
  );
};

export default GoogleAuthButton;
