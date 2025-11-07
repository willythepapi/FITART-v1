import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { styled } from 'nativewind';
import Icon from '../components/Icon';
import { useLanguage } from '../context/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const StyledView = styled(View);
const StyledTouchableOpacity = styled(TouchableOpacity);

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
    const { t } = useLanguage();
    const insets = useSafeAreaInsets();

    const iconMap: Record<string, 'home' | 'workouts' | 'camera' | 'progress' | 'settings'> = {
        Home: 'home',
        Workouts: 'workouts',
        Camera: 'camera',
        Progress: 'progress',
        Settings: 'settings',
    };

    return (
        <StyledView
            className="absolute bottom-0 left-0 right-0 bg-black/40 border-t border-dark-border"
            style={{ paddingBottom: insets.bottom, height: 64 + insets.bottom }}
        >
            <StyledView className="flex-row justify-around items-center h-16">
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label =
                        options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                            ? options.title
                            : route.name;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    const iconName = iconMap[route.name];

                    return (
                        <StyledTouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={options.tabBarTestID}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            className="flex-1 items-center justify-center h-full"
                            activeOpacity={0.7}
                        >
                            <StyledView className={`transition-all duration-base ${isFocused ? 'scale-110' : 'scale-100'}`}>
                                <Icon name={iconName} size={26} color={isFocused ? '#9DC8FF' : 'rgba(255,255,255,0.6)'} />
                            </StyledView>
                        </StyledTouchableOpacity>
                    );
                })}
            </StyledView>
        </StyledView>
    );
};

export default CustomTabBar;
