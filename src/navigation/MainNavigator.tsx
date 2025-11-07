import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, useColorScheme } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import WorkoutsScreen from '../screens/WorkoutsScreen';
import CameraScreen from '../screens/CameraScreen';
import ProgressScreen from '../screens/ProgressScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CustomTabBar from './CustomTabBar';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

const MainNavigator: React.FC = () => {
    const { theme } = useTheme();

    return (
        <NavigationContainer>
            <Tab.Navigator
                tabBar={props => <CustomTabBar {...props} />}
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: theme === 'dark' ? '#0D0F11' : '#F0F2F5',
                    },
                }}
            >
                <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name="Workouts" component={WorkoutsScreen} />
                <Tab.Screen name="Camera" component={CameraScreen} />
                <Tab.Screen name="Progress" component={ProgressScreen} />
                <Tab.Screen name="Settings" component={SettingsScreen} />
            </Tab.Navigator>
        </NavigationContainer>
    );
};

export default MainNavigator;
