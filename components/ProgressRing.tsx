import React from 'react';
import Icon from './Icon';

interface ProgressRingProps {
  percent: number;
  value: string | number;
  goal: string | number;
  label: string;
  color: string;
  iconName: React.ComponentProps<typeof Icon>['name'];
}

const ProgressRing: React.FC<ProgressRingProps> = ({ percent, value, goal, label, color, iconName }) => {
  const radius = 36;
  const stroke = 6;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const clampedPercent = Math.min(Math.max(percent, 0), 100);
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1 py-2 text-center">
      <div className="relative w-20 h-20">
        <svg height="100%" width="100%" viewBox="0 0 80 80" className="-rotate-90">
          <circle
            className="text-light-surface dark:text-dark-surface"
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx="40"
            cy="40"
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx="40"
            cy="40"
            className="transition-[stroke-dashoffset] duration-[350ms] ease-out-expo"
          />
        </svg>
        {/* Fix: Pass style prop to parent div instead of Icon component to fix type error. The Icon inherits the color via `currentColor`. */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ color }}>
             <Icon name={iconName} className="w-6 h-6" />
        </div>
      </div>
      <p className="font-semibold text-sm text-light-text-primary dark:text-dark-text-primary mt-1 whitespace-nowrap">{label}</p>
      <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
        <span className="font-bold text-light-text-primary dark:text-dark-text-primary">{value}</span>
        <span className="mx-0.5">/</span>
        <span>{goal}</span>
      </p>
    </div>
  );
};

export default ProgressRing;