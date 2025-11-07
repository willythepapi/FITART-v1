import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type NavItem = 'Home' | 'Workouts' | 'Camera' | 'Progress' | 'Settings';
export type ModalItem = 'Profile' | null;

export type TabParamList = {
    Home: undefined;
    Workouts: undefined;
    Camera: undefined;
    Progress: undefined;
    Settings: undefined;
};

export type HomeScreenProps = BottomTabScreenProps<TabParamList, 'Home'>;
export type WorkoutsScreenProps = BottomTabScreenProps<TabParamList, 'Workouts'>;
export type CameraScreenProps = BottomTabScreenProps<TabParamList, 'Camera'>;
export type ProgressScreenProps = BottomTabScreenProps<TabParamList, 'Progress'>;
export type SettingsScreenProps = BottomTabScreenProps<TabParamList, 'Settings'>;
