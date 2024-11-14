import { parseISO, format } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

export const getUserTimezone = () => {
  const userPreferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
  return userPreferences.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const convertToUserTimezone = (utcTime) => {
  const userTimezone = getUserTimezone();
  return utcToZonedTime(parseISO(utcTime), userTimezone);
};

export const convertToUTC = (localTime, timezone) => {
  return zonedTimeToUtc(localTime, timezone);
};

export const formatInTimezone = (date, formatStr = "yyyy-MM-dd'T'HH:mm") => {
  const userTimezone = getUserTimezone();
  const zonedDate = utcToZonedTime(date, userTimezone);
  return format(zonedDate, formatStr, { timeZone: userTimezone });
};
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };
  
  export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };
  
  // Add more formatting utilities as needed