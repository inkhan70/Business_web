
"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
import ur from '@/locales/ur.json';
import fa from '@/locales/fa.json';
import hi from '@/locales/hi.json';


// Define the shape of the translations
type Translations = typeof en;

// Default languages bundled with the app
const bundledTranslations: { [key: string]: Translations } = {
  en, ar, ur, fa, hi,
};

const bundledLanguageInfo = [
    { code: "en", name: "English" },
    { code: "ar", name: "العربية (Arabic)" },
    { code: "ur", name: "اردو (Urdu)" },
    { code: "fa", name: "فارسی (Farsi)" },
    { code: "hi", name: "हिन्दी (Hindi)" },
];

interface LanguageInfo {
    code: string;
    name: string;
}

// Define the shape of the context
interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: keyof Translations | string) => string;
  availableLanguages: LanguageInfo[];
}

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Create the provider component
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState(() => bundledTranslations);
  const [availableLanguages, setAvailableLanguages] = useState<LanguageInfo[]>(() => bundledLanguageInfo);

  const loadCustomLanguages = () => {
    const customLangsRaw = localStorage.getItem('customLanguages');
    if (customLangsRaw) {
        try {
            const customLangs: {code: string, name: string, dict: object}[] = JSON.parse(customLangsRaw);
            const newTranslations = { ...bundledTranslations };
            const newLangInfo = [...bundledLanguageInfo];

            customLangs.forEach(lang => {
                newTranslations[lang.code] = lang.dict as Translations;
                if (!newLangInfo.some(l => l.code === lang.code)) {
                     newLangInfo.push({ code: lang.code, name: lang.name });
                }
            });

            setTranslations(newTranslations);
            setAvailableLanguages(newLangInfo);
        } catch (e) {
            console.error("Failed to parse custom languages", e);
        }
    } else {
        setTranslations(bundledTranslations);
        setAvailableLanguages(bundledLanguageInfo);
    }
  }

  useEffect(() => {
    loadCustomLanguages();
    
    // Listen for custom event when languages are added/removed
    window.addEventListener('languageChange', loadCustomLanguages);

    return () => {
        window.removeEventListener('languageChange', loadCustomLanguages);
    }
  }, []);


  const t = (key: keyof Translations | string): string => {
    const lang_dict = translations[language] || translations['en'];
    const translationKey = key as keyof Translations;
    return lang_dict[translationKey] || translations['en'][translationKey] || String(key);
  };
  
  useEffect(() => {
    const dir = ['ar', 'ur', 'fa'].includes(language) ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language]);


  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages }}>
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
