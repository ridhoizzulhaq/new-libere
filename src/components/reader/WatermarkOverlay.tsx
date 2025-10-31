import { usePrivy } from "@privy-io/react-auth";

interface WatermarkOverlayProps {
  isEnabled: boolean;
}

const WatermarkOverlay = ({ isEnabled }: WatermarkOverlayProps) => {
  const { user } = usePrivy();

  if (!isEnabled || !user) {
    return null;
  }

  // Get user display info from Privy
  const userName = user.google?.name || user.wallet?.address?.slice(0, 10) + "..." || "User";
  const userEmail = user.google?.email || user.wallet?.address || "";

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 flex items-center justify-center">
      {/* Single centered watermark - 75% larger */}
      <div className="text-center opacity-15 select-none">
        <div
          className="font-bold text-gray-600"
          style={{ fontSize: '3.5rem' }}
        >
          {userName}
        </div>
        <div
          className="text-gray-500 mt-2"
          style={{ fontSize: '2rem' }}
        >
          {userEmail}
        </div>
      </div>
    </div>
  );
};

export default WatermarkOverlay;
