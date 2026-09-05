import React, { createContext, useContext, useState, useCallback } from 'react';
import en from './en.js';
import hi from './hi.js';
import mr from './mr.js';

const dictionaries = { en, hi, mr };

const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(
    () => localStorage.getItem('sv360_lang') || 'en'
  );

  const setLang = useCallback((newLang) => {
    if (!dictionaries[newLang]) return;
    localStorage.setItem('sv360_lang', newLang);
    setLangState(newLang);
    // Set lang attr on <html> so Devanagari font applies via CSS
    document.documentElement.setAttribute('lang', newLang);
  }, []);

  // Set initial lang attribute
  React.useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const t = useCallback(
    (key) => {
      const dict = dictionaries[lang] || en;
      return dict[key] !== undefined ? dict[key] : (en[key] !== undefined ? en[key] : key);
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}

export default LanguageContext;
