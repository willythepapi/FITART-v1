import React from 'react';

interface AppCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const AppCard: React.FC<AppCardProps> = ({ children, className = '', ...props }) => {
  return (
    <div {...props} className={`bg-light-card dark:bg-dark-card rounded-radius-std py-[18px] px-[22px] bg-gradient-to-b from-transparent to-white/[.02] ${className}`}>
      {children}
    </div>
  );
};

export default AppCard;