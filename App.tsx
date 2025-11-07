
import React, { useState, useEffect } from 'react';
// Fix: Import TouchableOpacity from react-native.
import { View, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import * as Updates from 'expo-updates';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './screens/HomeScreen';
import WorkoutsScreen from './screens/WorkoutsScreen';
import CameraScreen from './screens/CameraScreen';
import ProgressScreen from './screens/ProgressScreen';
import SettingsScreen from './screens/SettingsScreen';
import BottomNav from './components/BottomNav';
import type { NavItem, ModalItem } from './types';
import Modal from './components/Modal';
import ProfileScreen from './screens/ProfileScreen';
import MealLoggerModal from './components/MealLoggerModal';
import Icon from './components/Icon';
import ActionWheel from './components/ActionWheel';
import MealsHistoryScreen from './screens/MealsHistoryScreen';

import { UseCaseProvider } from './application/usecase-provider';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { UnitProvider } from './context/UnitContext';
import { StyleProvider } from './context/StyleContext';

const ActionFab: React.FC<{ onClick: () => void; isOpen: boolean }> = ({ onClick, isOpen }) => (
    <View style={styles.fabContainer}>
        <TouchableOpacity
            onPress={onClick}
            style={styles.fab}
            activeOpacity={0.8}
        >
            <View style={{ transform: [{ rotate: isOpen ? '45deg' : '0deg' }] }}>
              {/* Fix: Pass size and color props to Icon component. Icon component is updated to handle these. */}
              <Icon name="plus" size={28} color="#FFFFFF" />
            </div>
        </TouchableOpacity>
    </View>
);


const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavItem>('Home');
  const [activeModal, setActiveModal] = useState<ModalItem>(null);
  const { t } = useLanguage();
  const { theme } = useTheme();

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
  
  const refreshHomeData = () => setHomeDataVersion(v => v + 1);

  const renderScreen = () => {
    switch (activeTab) {
        case 'Home':
            return <HomeScreen setActiveTab={setActiveTab} onViewMeals={() => setIsMealsHistoryOpen(true)} dataVersion={homeDataVersion} />;
        case 'Workouts':
            return <WorkoutsScreen />;
        case 'Camera':
            return <CameraScreen setActiveTab={setActiveTab} />;
        case 'Progress':
            return <ProgressScreen />;
        case 'Settings':
            return <SettingsScreen openProfile={() => setActiveModal('Profile')} />;
        default:
            return null;
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme === 'dark' ? '#000' : '#F0F2F5' }]} edges={['top', 'left', 'right']}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <View style={{ flex: 1, paddingBottom: 64 }}>
        {renderScreen()}
      </View>
      
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
    </SafeAreaView>
  );
};

const App: React.FC = () => {
    return (
        <UseCaseProvider>
            <LanguageProvider>
                <ThemeProvider>
                    <UnitProvider>
                        <StyleProvider>
                            <SafeAreaProvider>
                                <AppContent />
                            </SafeAreaProvider>
                        </StyleProvider>
                    </UnitProvider>
                </ThemeProvider>
            </LanguageProvider>
        </UseCaseProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 90,
        left: '50%',
        transform: [{ translateX: -28 }],
        zIndex: 25,
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(58, 58, 60, 0.8)', // fab-bg with backdrop blur approximation
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});


export default App;