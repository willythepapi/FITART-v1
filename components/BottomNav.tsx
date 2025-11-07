
import React from 'react';
import type { NavItem } from '../types';
import Icon from './Icon';
import { useLanguage } from '../context/LanguageContext';

interface BottomNavProps {
  activeTab: NavItem;
  setActiveTab: (tab: NavItem) => void;
}

const NavButton: React.FC<{
  label: string;
  iconName: 'home' | 'workouts' | 'camera' | 'progress' | 'settings';
  isActive: boolean;
  onClick: () => void;
}> = ({ label, iconName, isActive, onClick }) => {
  const activeClasses = 'text-accent-active scale-[1.08] drop-shadow-accent-glow';
  const inactiveClasses = 'text-white/60';
  
  return (
    <button 
      onClick={onClick} 
      className={`flex items-center justify-center w-full h-full transition-colors duration-fast focus:outline-none group`}
      aria-label={label}
    >
      <div className={`transition-all duration-base ${isActive ? activeClasses : `${inactiveClasses} group-hover:text-white/90`}`}>
        <Icon name={iconName} className={`w-[26px] h-[26px]`} />
      </div>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();
  const navItems: { label: NavItem; icon: 'home' | 'workouts' | 'camera' | 'progress' | 'settings' }[] = [
    { label: 'Home', icon: 'home' },
    { label: 'Workouts', icon: 'workouts' },
    { label: 'Camera', icon: 'camera' },
    { label: 'Progress', icon: 'progress' },
    { label: 'Settings', icon: 'settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-black/40 backdrop-blur-[12px] border-t border-dark-border z-10">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto px-2">
        {navItems.map((item) => (
          <NavButton
            key={item.label}
            label={t(`nav_${item.label.toLowerCase()}` as any)}
            iconName={item.icon}
            isActive={activeTab === item.label}
            onClick={() => setActiveTab(item.label)}
          />
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;