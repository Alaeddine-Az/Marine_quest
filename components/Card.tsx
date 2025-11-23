import React, { useRef, useEffect } from 'react';
import { CardData, CardType } from '../types';
import gsap from 'gsap';

interface CardProps {
  data: CardData;
  isRevealed: boolean;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ data, isRevealed, onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        rotationY: isRevealed ? 180 : 0,
        duration: 0.5,
        ease: "power2.inOut",
      });
    }
  }, [isRevealed]);

  const getCardStyle = (type: CardType) => {
    switch (type) {
      case CardType.ROSE:
        return {
          bg: 'bg-gradient-to-br from-emerald-900 to-emerald-700',
          border: 'border-emerald-500',
          icon: '🌹',
          title: 'Rose',
          textColor: 'text-emerald-100'
        };
      case CardType.THORN:
        return {
          bg: 'bg-gradient-to-br from-rose-950 to-rose-800',
          border: 'border-rose-600',
          icon: '🌵',
          title: 'Thorn',
          textColor: 'text-rose-100'
        };
      case CardType.BUD:
        return {
          bg: 'bg-gradient-to-br from-amber-900 to-amber-700',
          border: 'border-amber-400',
          icon: '🌻',
          title: 'Bud',
          textColor: 'text-amber-100'
        };
      default: return { bg: 'bg-slate-700', border: 'border-slate-500', icon: '❓', title: '?', textColor: 'text-white' };
    }
  };

  const style = getCardStyle(data.type);

  return (
    <div
      className="relative w-72 h-[28rem] perspective-1000 cursor-pointer group select-none"
      onClick={onClick}
    >
      <div
        ref={cardRef}
        className="relative w-full h-full preserve-3d"
      >

        {/* --- Card Back --- */}
        <div className="absolute w-full h-full backface-hidden rounded-xl border-8 border-wood-light bg-wood-dark shadow-high-contrast flex flex-col items-center justify-center wood-texture lantern-glow">
          <div className="absolute inset-2 border border-wood-accent/30 rounded-lg"></div>
          <div className="w-24 h-24 rounded-full border-4 border-gold flex items-center justify-center bg-black/40 shadow-inner mb-6 group-hover:scale-110 transition">
            <i className="fa-solid fa-skull-crossbones text-5xl text-gold opacity-90 text-glow-gold"></i>
          </div>
          <h3 className="font-pirate text-gold text-3xl tracking-widest drop-shadow-md text-glow-gold">QUEST</h3>
          <div className="mt-8 w-16 h-1 bg-gold/30 rounded-full"></div>
          <p className="text-parchment/60 text-xs uppercase tracking-widest mt-2">S.S. Insight Log</p>
        </div>

        {/* --- Card Front --- */}
        <div className={`absolute w-full h-full backface-hidden rotate-y-180 rounded-xl shadow-high-contrast flex flex-col p-1 ${style.bg}`}>
          {/* Gold Border Wrapper */}
          <div className={`w-full h-full rounded-lg border-2 border-gold/50 p-1`}>
            {/* Inner Border/Parchment Area */}
            <div className={`w-full h-full bg-black/20 rounded border-4 ${style.border} p-6 flex flex-col relative overflow-hidden shadow-inner`}>

              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-gold/30 rounded-tl"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-gold/30 rounded-tr"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-gold/30 rounded-bl"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-gold/30 rounded-br"></div>

              {/* Header */}
              <div className="flex justify-between items-center border-b-2 border-white/10 pb-4 mb-4 relative z-10">
                <span className="text-4xl drop-shadow-md filter">{style.icon}</span>
                <span className={`font-pirate text-3xl uppercase tracking-wide text-white drop-shadow-md text-glow-gold`}>
                  {style.title}
                </span>
              </div>

              {/* Content */}
              <div className="flex-grow flex items-center justify-center text-center relative z-10">
                <p className="text-xl font-serif text-white leading-relaxed italic font-medium drop-shadow-sm">
                  <span className="text-6xl absolute -top-6 -left-4 opacity-20 font-pirate text-white">"</span>
                  {data.content}
                  <span className="text-6xl absolute -bottom-10 -right-4 opacity-20 font-pirate text-white">"</span>
                </p>
              </div>

              {/* Footer Stamp */}
              <div className="mt-auto pt-4 flex justify-center opacity-80 relative z-10">
                <div className="border-4 border-red-400/50 text-red-300 font-bold px-4 py-1 transform -rotate-6 text-sm uppercase rounded shadow-sm tracking-widest">
                  CONFIDENTIAL
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Card;