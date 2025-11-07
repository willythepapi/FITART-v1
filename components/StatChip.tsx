import React from 'react';

interface StatChipProps {
  label: string;
  color?: 'green' | 'blue' | 'yellow';
}

const StatChip: React.FC<StatChipProps> = ({ label, color = 'green' }) => {
  const colorClasses = {
    green: 'bg-accent/20 text-green-700 dark:text-accent',
    blue: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
    yellow: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
  };
  return (
    <div className={`text-xs font-bold px-2.5 py-1 rounded-full inline-block ${colorClasses[color]}`}>
      {label}
    </div>
  );
};
export default StatChip;