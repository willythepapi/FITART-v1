import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { translations } from './translations';

type Language = 'en' | 'tr';
type Translations = typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof Translations, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const storedLang = localStorage.getItem('zenithfit_language');
    // Default to English if no preference is stored
    return (storedLang as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('zenithfit_language', language);
  }, [language]);

  const t = useCallback((key: keyof Translations, params?: Record<string, string | number>): string => {
    let translation = translations[language][key] || translations.en[key];
    if (params) {
        Object.keys(params).forEach(paramKey => {
            translation = translation.replace(`{{${paramKey}}}`, String(params[paramKey]));
        });
    }
    return translation;
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
