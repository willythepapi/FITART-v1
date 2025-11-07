
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FontSize = 'sm' | 'base' | 'lg';

interface StyleContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const FONT_SIZE_KEY = 'zenithfit_fontsize';
const StyleContext = createContext<StyleContextType | undefined>(undefined);

export const StyleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSizeState] = useState<FontSize>('base');

  useEffect(() => {
    const loadFontSize = async () => {
      try {
        const storedSize = await AsyncStorage.getItem(FONT_SIZE_KEY);
        if (storedSize) {
          setFontSizeState(storedSize as FontSize);
        }
      } catch (error) {
        console.error('Failed to load font size from storage', error);
      }
    };
    loadFontSize();
  }, []);

  const setFontSize = async (size: FontSize) => {
    try {
      await AsyncStorage.setItem(FONT_SIZE_KEY, size);
      setFontSizeState(size);
    } catch (error) {
      console.error('Failed to save font size to storage', error);
    }
  };

  const value = useMemo(() => ({ fontSize, setFontSize }), [fontSize]);

  return (
    <StyleContext.Provider value={value}>
      {children}
    </StyleContext.Provider>
  );
};

export const useStyle = (): StyleContextType => {
  const context = useContext(StyleContext);
  if (!context) {
    throw new Error('useStyle must be used within a StyleProvider');
  }
  return context;
};
