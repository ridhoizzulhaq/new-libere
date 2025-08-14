import React from "react";
import GoogleIcon from "../../assets/icons/GoogleIcon";

interface GoogleAuthButtonProps {
  onClick?: () => void;
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({onClick}) => {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer w-full max-w-xs font-bold border border-zinc-200 rounded-lg py-3 bg-white text-dark-100 flex items-center justify-center focus:outline-none"
    >
      <div className="bg-white p-2 rounded-full">
        <GoogleIcon size={16} />
      </div>
      <span className="ml-4">Sign Up with Google</span>
    </button>
  );
};

export default GoogleAuthButton;
