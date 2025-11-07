import React from 'react';
import Icon from './Icon';

interface AppSectionTitleProps {
  title: string;
  iconName?: React.ComponentProps<typeof Icon>['name'];
  className?: string;
}

const AppSectionTitle: React.FC<AppSectionTitleProps> = ({ title, iconName, className }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {iconName && <Icon name={iconName} className="w-6 h-6 text-accent" />}
      <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary tracking-title">{title}</h2>
    </div>
  );
};

export default AppSectionTitle;
