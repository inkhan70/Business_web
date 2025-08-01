
"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';

// Define the shape of the translations
type Translations = typeof en;

const translations: { [key: string]: Translations } = {
  en,
  ar,
};

// Define the shape of the context
interface LanguageContextType {
  language: keyof typeof translations;
  setLanguage: (language: keyof typeof translations) => void;
  t: (key: keyof Translations) => string;
}

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Create the provider component
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<keyof typeof translations>('en');

  const t = (key: keyof Translations): string => {
    // Safely access translations, falling back to English if the language or key doesn't exist.
    const lang_dict = translations[language] || translations['en'];
    return lang_dict[key] || translations['en'][key] || String(key);
  };
  
  useEffect(() => {
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language]);


  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Create a custom hook for using the context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
