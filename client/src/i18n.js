import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import axios from 'axios';
import { API_BASE_URL } from '@/config/apiConstant';

const backendPlugin = {
  type: 'backend',
  init: () => {},
  read: async (language, namespace, callback) => {
    try {
      const res = await axios.get(`${API_BASE_URL}translations/${language}`);
      callback(null, res.data);
    } catch (error) {
      callback(error, null);
    }
  },
};

i18n
  .use(backendPlugin)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;