
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const THEME_KEY = 'zenithfit_theme';
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemTheme = useColorScheme();
  // Fix: Ensure systemTheme is correctly resolved to 'light' or 'dark' to prevent invalid state values.
  const [theme, setThemeState] = useState<Theme>(systemTheme === 'light' ? 'light' : 'dark');

  useEffect(() => {
    const loadTheme = async () => {
      // Fix: Default to a valid theme if system theme is null or unspecified.
      const systemThemeOrDefault = systemTheme === 'light' ? 'light' : 'dark';
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_KEY);
        // Fix: Validate stored theme before setting it.
        if (storedTheme === 'light' || storedTheme === 'dark') {
          setThemeState(storedTheme as Theme);
        } else {
          setThemeState(systemThemeOrDefault);
        }
      } catch (error) {
        console.error('Failed to load theme from storage', error);
        setThemeState(systemThemeOrDefault);
      }
    };
    loadTheme();
  }, [systemTheme]);

  const setTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Failed to save theme to storage', error);
    }
  };

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
