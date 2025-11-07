import React from 'react';

interface CircularProgressProps {
  percent: number;
  radius?: number;
  strokeWidth?: number;
  className?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percent,
  radius = 100,
  strokeWidth = 10,
  className = '',
}) => {
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const clampedPercent = Math.min(Math.max(percent, 0), 100);
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference;

  const size = radius * 2;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg height={size} width={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          className="text-dark-surface"
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          className="text-accent"
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.35s' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-5xl font-semibold text-dark-text-primary tracking-display">
          {Math.round(percent)}%
        </span>
        <span className="text-sm font-medium text-dark-text-secondary mt-1">
          towards goal
        </span>
      </div>
    </div>
  );
};

export default CircularProgress;
