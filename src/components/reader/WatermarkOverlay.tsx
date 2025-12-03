import { usePrivy } from "@privy-io/react-auth";

interface WatermarkOverlayProps {
  isEnabled: boolean;
}

const WatermarkOverlay = ({ isEnabled }: WatermarkOverlayProps) => {
  const { user } = usePrivy();

  if (!isEnabled || !user) {
    return null;
  }

  const userName = user.google?.name || user.wallet?.address?.slice(0, 10) + "..." || "User";
  const userEmail = user.google?.email || user.wallet?.address || "";

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {/* Single center watermark (simplified) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center opacity-25 select-none">
          <div
            className="font-bold text-gray-600"
            style={{ fontSize: '4rem' }}
          >
            {userName}
          </div>
          <div
            className="text-gray-500 mt-2"
            style={{ fontSize: '2.5rem' }}
          >
            {userEmail}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatermarkOverlay;
