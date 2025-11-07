
import React, { useState, useEffect } from 'react';
import * as Updates from 'expo-updates';
import HomeScreen from './screens/HomeScreen';
import WorkoutsScreen from './screens/WorkoutsScreen';
import CameraScreen from './screens/CameraScreen';
import ProgressScreen from './screens/ProgressScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import BottomNav from './components/BottomNav';
import type { NavItem, ModalItem } from './types';
import Modal from './components/Modal';
import { useLanguage } from './context/LanguageContext';
import MealLoggerModal from './components/MealLoggerModal';
import Icon from './components/Icon';
import ActionWheel from './components/ActionWheel';
import MealsHistoryScreen from './screens/MealsHistoryScreen';


const ActionFab: React.FC<{ onClick: () => void; isOpen: boolean }> = ({ onClick, isOpen }) => (
    <button
        onClick={onClick}
        className="fixed bottom-[90px] left-1/2 -translate-x-1/2 w-14 h-14 bg-fab-bg backdrop-blur-[12px] rounded-full flex items-center justify-center text-fab-icon shadow-lg transition-transform duration-fast hover:scale-[1.08] active:scale-95 z-[25]"
        aria-label="Log Activity"
    >
        <div className={`transition-transform duration-base ${isOpen ? 'rotate-45' : ''}`}>
          <Icon name="plus" className="w-7 h-7" />
        </div>
    </button>
);


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavItem>('Home');
  const [activeModal, setActiveModal] = useState<ModalItem>(null);
  const { t } = useLanguage();

  const [isActionWheelOpen, setIsActionWheelOpen] = useState(false);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [isMealsHistoryOpen, setIsMealsHistoryOpen] = useState(false);
  const [homeDataVersion, setHomeDataVersion] = useState(0);

  useEffect(() => {
    const applyUpdates = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (e) {
        // fail silently
      }
    };
    applyUpdates();
  }, []);

  const ScreenWrapper: React.FC<{isActive: boolean, children: React.ReactNode}> = ({isActive, children}) => (
    <div hidden={!isActive} className={isActive ? 'animate-screenFadeIn' : ''}>
      {children}
    </div>
  );
  
  const refreshHomeData = () => setHomeDataVersion(v => v + 1);

  return (
    <div className="bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary min-h-screen font-sans">
      <main className={`pb-20 transition-all duration-200 ease-out`}>
        <ScreenWrapper isActive={activeTab === 'Home'}><HomeScreen setActiveTab={setActiveTab} onViewMeals={() => setIsMealsHistoryOpen(true)} dataVersion={homeDataVersion} /></ScreenWrapper>
        <ScreenWrapper isActive={activeTab === 'Workouts'}><WorkoutsScreen /></ScreenWrapper>
        <ScreenWrapper isActive={activeTab === 'Camera'}><CameraScreen setActiveTab={setActiveTab} /></ScreenWrapper>
        <ScreenWrapper isActive={activeTab === 'Progress'}><ProgressScreen /></ScreenWrapper>
        <ScreenWrapper isActive={activeTab === 'Settings'}><SettingsScreen openProfile={() => setActiveModal('Profile')} /></ScreenWrapper>
      </main>
      
      <Modal
        isOpen={activeModal === 'Profile'}
        onClose={() => setActiveModal(null)}
        title={t('profile_title')}
      >
        <ProfileScreen />
      </Modal>

      {activeTab === 'Home' && <ActionFab isOpen={isActionWheelOpen} onClick={() => setIsActionWheelOpen(!isActionWheelOpen)} />}

       <ActionWheel
          isOpen={isActionWheelOpen}
          onClose={() => setIsActionWheelOpen(false)}
          onLogMeal={() => {
              setIsActionWheelOpen(false);
              setIsMealModalOpen(true);
          }}
          onLogWorkout={() => {
              setIsActionWheelOpen(false);
              setActiveTab('Workouts');
          }}
          onTrackProgress={() => {
              setIsActionWheelOpen(false);
              setActiveTab('Camera');
          }}
      />

       <MealLoggerModal 
          isOpen={isMealModalOpen}
          onClose={() => setIsMealModalOpen(false)}
          onSaveSuccess={refreshHomeData}
      />

      {isMealsHistoryOpen && (
        <MealsHistoryScreen 
            onClose={() => setIsMealsHistoryOpen(false)}
            dataVersion={homeDataVersion}
        />
      )}

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;