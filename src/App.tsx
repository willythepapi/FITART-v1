import './global.css';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UseCaseProvider } from './application/usecase-provider';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { UnitProvider } from './context/UnitContext';
import { StyleProvider } from './context/StyleContext';
import MainNavigator from './navigation/MainNavigator';

const App: React.FC = () => {
    return (
        <UseCaseProvider>
            <LanguageProvider>
                <ThemeProvider>
                    <UnitProvider>
                        <StyleProvider>
                            <SafeAreaProvider>
                                <MainNavigator />
                            </SafeAreaProvider>
                        </StyleProvider>
                    </UnitProvider>
                </ThemeProvider>
            </LanguageProvider>
        </UseCaseProvider>
    );
};

export default App;
