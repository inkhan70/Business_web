
"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
import ur from '@/locales/ur.json';
import fa from '@/locales/fa.json';
import es from '@/locales/es.json';
import fr from '@/locales/fr.json';
import de from '@/locales/de.json';
import hi from '@/locales/hi.json';
import zh from '@/locales/zh.json';


// Define the shape of the translations
type Translations = typeof en;

const translations: { [key: string]: Translations } = {
  en,
  ar,
  ur,
  fa,
  es,
  fr,
  de,
  hi,
  zh,
};

// Define the shape of the context
interface LanguageContextType {
  language: keyof typeof translations;
  setLanguage: (language: keyof typeof translations) => void;
  t: (key: keyof Translations | string) => string;
}

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Create the provider component
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<keyof typeof translations>('en');

  const t = (key: keyof Translations | string): string => {
    // Safely access translations, falling back to English if the language or key doesn't exist.
    const lang_dict = translations[language] || translations['en'];
    // The key must be asserted as a key of Translations for the lookup to be valid
    const translationKey = key as keyof Translations;
    return lang_dict[translationKey] || translations['en'][translationKey] || String(key);
  };
  
  useEffect(() => {
    const dir = ['ar', 'ur', 'fa'].includes(language) ? 'rtl' : 'ltr';
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
