import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export type FontSize = 'sm' | 'base' | 'lg';

interface StyleContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const StyleContext = createContext<StyleContextType | undefined>(undefined);

export const StyleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    const storedSize = localStorage.getItem('zenithfit_fontsize');
    return (storedSize as FontSize) || 'base';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('font-sm', 'font-base', 'font-lg');
    root.classList.add(`font-${fontSize}`);
    localStorage.setItem('zenithfit_fontsize', fontSize);
  }, [fontSize]);

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
