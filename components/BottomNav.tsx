
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import type { NavItem } from '../types';
import Icon from './Icon';
import { useLanguage } from '../context/LanguageContext';

const StyledView = styled(View);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface NavButtonProps {
  label: string;
  iconName: 'home' | 'workouts' | 'camera' | 'progress' | 'settings';
  isActive: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ label, iconName, isActive, onClick }) => {
  const activeClasses = 'text-accent-active';
  const inactiveClasses = 'text-white/60';
  
  return (
    <StyledTouchableOpacity 
      onPress={onClick} 
      className="flex-1 items-center justify-center h-full"
      activeOpacity={0.7}
      aria-label={label}
    >
      <StyledView className={`transition-all duration-base ${isActive ? 'scale-110' : 'scale-100'}`}>
        <Icon name={iconName} size={26} color={isActive ? '#9DC8FF' : 'rgba(255,255,255,0.6)'} />
      </StyledView>
    </StyledTouchableOpacity>
  );
};

const BottomNav: React.FC<{ activeTab: NavItem; setActiveTab: (tab: NavItem) => void }> = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();
  const navItems: { label: NavItem; icon: 'home' | 'workouts' | 'camera' | 'progress' | 'settings' }[] = [
    { label: 'Home', icon: 'home' },
    { label: 'Workouts', icon: 'workouts' },
    { label: 'Camera', icon: 'camera' },
    { label: 'Progress', icon: 'progress' },
    { label: 'Settings', icon: 'settings' },
  ];

  return (
    <StyledView className="absolute bottom-0 left-0 right-0 h-16 bg-black/40 border-t border-dark-border z-10">
      <StyledView className="flex-row justify-around items-center h-full max-w-lg mx-auto px-2">
        {navItems.map((item) => (
          <NavButton
            key={item.label}
            label={t(`nav_${item.label.toLowerCase()}` as any)}
            iconName={item.icon}
            isActive={activeTab === item.label}
            onClick={() => setActiveTab(item.label)}
          />
        ))}
      </StyledView>
    </StyledView>
  );
};

export default BottomNav;