import React from 'react';

interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  showValue?: boolean;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  label, 
  value, 
  max, 
  showValue = false,
  color = 'bg-gradient-to-r from-violet-400 to-fuchsia-400'
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full mb-4">
      <div className="flex justify-between items-end mb-1">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        {showValue && <span className="text-xs text-slate-400 font-mono">{Math.round(value)}</span>}
      </div>
      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
