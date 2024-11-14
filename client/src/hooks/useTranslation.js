import { useState, useEffect, useCallback, useRef } from 'react';
import i18next from 'i18next';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/config/apiConstant';

i18next.init({
  lng: 'en',
  resources: {
    en: { translation: {} },
    fr: { translation: {} },
    de: { translation: {} },
  },
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

const useTranslation = () => {
  const storedLanguage = localStorage.getItem('preferredLanguage');
  const navigate = useNavigate();
  const [language, setLanguage] = useState(i18next.language);
  const [translations, setTranslations] = useState({});
  const [newTranslations, setNewTranslations] = useState([]);
  const newTranslationsSentRef = useRef(false);  // Tracks if new translations have been sent

  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      setLanguage(lng);
    };

    i18next.on('languageChanged', handleLanguageChanged);

    return () => {
      i18next.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  useEffect(() => {
    if (storedLanguage) {
      i18next.changeLanguage(storedLanguage);
    }
  }, [storedLanguage]);

  const t = useCallback((key, text) => {
    if (translations[key]) {
      return translations[key];
    }
    setNewTranslations(async (prev) => {
      try {
        const response = await axios.post(`${API_BASE_URL}translations/translate`, {
          text,
          targetLang:language,
          key
        });
       const translation =response.data.translation;
        const alreadyExists = prev.some((translation) => translation.key === key);
      if (!alreadyExists) {
        return [...prev,...translation ];
      }
      return prev;
      } catch (error) {
        console.error('Translation failed:', error);
        return text;
      }
      
    });
    return text;
  }, [translations]);

  const e = useCallback(async (key, options = {}) => {
    let translatedText = i18next.t(key, options);
    return translatedText;
  }, [language]);

  const changeLanguage = useCallback((newLang) => {
    i18next.changeLanguage(newLang, (err) => {
      if (err) {
        console.error('Error changing language:', err);
      } else {
        setLanguage(newLang);
        const newPath = window.location.pathname.replace(/^\/[^\/]+/, `/${newLang}`);
        navigate(newPath);
        localStorage.setItem('preferredLanguage', newLang);
      }
    });
  }, [navigate]);

  const getTranslations = useCallback(async (keys) => {
    try {
      console.log('Current language:', language);
      const response = await axios.post(`${API_BASE_URL}translations/getTranslations`, {
        lang: language,
        keys
      });
      console.log('Received translations:', response.data.translations);
      setTranslations((prev) => ({ ...prev, ...response.data.translations }));
      return response.data.translations;
    } catch (error) {
      console.error('Failed to fetch translations:', error);
      return keys.reduce((acc, key) => ({ ...acc, [key]: key }), {});
    }
  }, [language]);

  // UseEffect to send new translations only once
  

  return { t, e, getTranslations, changeLanguage, language, i18n: i18next };
};

export default useTranslation;
