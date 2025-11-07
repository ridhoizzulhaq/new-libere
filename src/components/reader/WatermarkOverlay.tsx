import { usePrivy } from "@privy-io/react-auth";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

interface WatermarkOverlayProps {
  isEnabled: boolean;
}

const WatermarkOverlay = ({ isEnabled }: WatermarkOverlayProps) => {
  const { user } = usePrivy();
  const { id: bookId } = useParams();
  const [timestamp] = useState(new Date().toISOString());
  const [forensicPositions, setForensicPositions] = useState<Array<{x: number, y: number}>>([]);

  // Generate forensic watermark positions (random, but deterministic per session)
  useEffect(() => {
    const positions = [];
    const seed = user?.wallet?.address || '';

    // Generate 5 random positions based on user address (forensic tracking)
    for (let i = 0; i < 5; i++) {
      const hash = seed.charCodeAt(i % seed.length) + i;
      positions.push({
        x: (hash * 13) % 100, // Pseudo-random X (0-100%)
        y: (hash * 17) % 100, // Pseudo-random Y (0-100%)
      });
    }

    setForensicPositions(positions);
  }, [user]);

  if (!isEnabled || !user) {
    return null;
  }

  // Get user display info from Privy
  const userName = user.google?.name || user.wallet?.address?.slice(0, 10) + "..." || "User";
  const userEmail = user.google?.email || user.wallet?.address || "";
  const userWallet = user.smartWallet?.address || user.wallet?.address || "";

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {/* LAYER 1: Center watermark (prominent, deterrent) */}
      <div className="absolute inset-0 flex items-center justify-center">
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

      {/* LAYER 2: Bottom-left watermark (wallet address + timestamp) */}
      <div className="absolute bottom-4 left-4 opacity-10 select-none">
        <div className="text-xs text-gray-600 font-mono">
          <div>Licensed to: {userWallet.slice(0, 8)}...{userWallet.slice(-6)}</div>
          <div className="mt-1">Book ID: {bookId} | {new Date(timestamp).toLocaleDateString()}</div>
          <div className="mt-1 text-[10px]">Libere Digital Library - Unauthorized distribution prohibited</div>
        </div>
      </div>

      {/* LAYER 3: Bottom-right watermark (timestamp + session info) */}
      <div className="absolute bottom-4 right-4 opacity-10 select-none text-right">
        <div className="text-xs text-gray-600 font-mono">
          <div>{new Date(timestamp).toLocaleTimeString()}</div>
          <div className="mt-1 text-[10px]">Session: {timestamp.slice(0, 19)}</div>
        </div>
      </div>

      {/* LAYER 4: Forensic watermarks (invisible to naked eye, for leak tracking) */}
      {forensicPositions.map((pos, index) => (
        <div
          key={index}
          className="absolute select-none"
          style={{
            top: `${pos.y}%`,
            left: `${pos.x}%`,
            opacity: 0.02, // Almost invisible
            fontSize: '8px',
            color: '#666',
            pointerEvents: 'none',
            userSelect: 'none',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {userWallet.slice(0, 6)}-{bookId}-{index}
        </div>
      ))}

      {/* LAYER 5: Repeating diagonal watermarks (background pattern) */}
      <div className="absolute inset-0 opacity-5 select-none overflow-hidden">
        <div
          className="absolute"
          style={{
            top: '10%',
            left: '-10%',
            width: '120%',
            height: '120%',
            background: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 200px,
              rgba(100, 100, 100, 0.3) 200px,
              rgba(100, 100, 100, 0.3) 202px
            )`,
          }}
        >
          <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-32">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="text-gray-600 font-bold whitespace-nowrap"
                style={{
                  fontSize: '1.5rem',
                  transform: 'rotate(-45deg)',
                }}
              >
                {userName} • {userEmail.split('@')[0]}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LAYER 6: Corner watermarks (always visible on screenshots) */}
      <div className="absolute top-4 left-4 opacity-10 select-none">
        <div className="text-xs text-gray-600 font-bold">
          {userName}
        </div>
      </div>
      <div className="absolute top-4 right-4 opacity-10 select-none text-right">
        <div className="text-xs text-gray-600 font-bold">
          {userName}
        </div>
      </div>
    </div>
  );
};

export default WatermarkOverlay;
