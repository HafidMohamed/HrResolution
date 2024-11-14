// src/utils/localeUtils.js
import moment from 'moment-timezone';

export const getUserLocaleData = () => {
  const storedConsent = localStorage.getItem('cookieConsent');
  if (storedConsent) {
    const { locale, timezone } = JSON.parse(storedConsent);
    return { locale, timezone };
  }
  
  return {
    locale: navigator.language || 'en-US',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
};

export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  const { timezone } = getUserLocaleData();
  return moment(date).tz(timezone).format(format);
};