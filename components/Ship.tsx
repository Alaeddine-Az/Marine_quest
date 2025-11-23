import React from 'react';

interface ShipProps {
  progress: number; // 0 to 100
}

const Ship: React.FC<ShipProps> = ({ progress }) => {
  // Map 0-100 progress to 5% - 85% screen width
  const leftPos = 5 + (progress / 100) * 80;

  return (
    <div
      className="absolute bottom-4 z-30 transition-all duration-[2000ms] ease-in-out will-change-transform"
      style={{ left: `${leftPos}%` }}
    >
      {/* Container adds bobbing motion */}
      <div className="animate-float relative">

        {/* Label Moved to Top */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black/60 px-2 py-1 rounded text-[10px] text-gold font-mono border border-gold/30 shadow-lg z-40">
          {Math.round(progress)}% to Island
        </div>

        {/* Ship Image */}
        <div className="w-24 h-24 md:w-40 md:h-40 drop-shadow-2xl">
          <img
            src="/ship.png"
            alt="Pirate Ship"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Glow Effect if High Score / Near Island */}
        {progress > 80 && (
          <div className="absolute inset-0 bg-gold opacity-30 blur-2xl rounded-full animate-pulse pointer-events-none"></div>
        )}
      </div>
    </div>
  );
};

export default Ship;