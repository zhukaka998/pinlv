import React from 'react';
import { FrequencyLevel } from '../types';

interface PyramidProps {
  currentLevel: number;
  levels: FrequencyLevel[];
}

const Pyramid: React.FC<PyramidProps> = ({ currentLevel, levels }) => {
  // Sort levels descending
  const sortedLevels = [...levels].sort((a, b) => b.level - a.level);

  return (
    <div className="flex flex-col items-center w-full py-8">
      {sortedLevels.map((lvl, index) => {
        const isCurrent = lvl.level === currentLevel;
        const width = 100 - (index * (60 / levels.length)); // Top is narrower
        
        return (
          <div 
            key={lvl.level}
            className={`
              h-8 md:h-10 flex items-center justify-center border-b border-white/5 transition-all duration-500
              ${isCurrent ? 'bg-gradient-to-r from-fuchsia-600/40 via-pink-500/40 to-fuchsia-600/40 scale-110 z-10 shadow-[0_0_20px_rgba(236,72,153,0.4)] rounded-md border-pink-400/50' : 'bg-white/5'}
            `}
            style={{ width: `${width}%` }}
          >
            <span className={`text-xs md:text-sm font-serif ${isCurrent ? 'text-white font-bold tracking-widest' : 'text-slate-400/50'}`}>
              {lvl.name} {isCurrent && `(${lvl.level})`}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default Pyramid;
