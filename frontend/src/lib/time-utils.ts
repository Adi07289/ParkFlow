// Time utility functions for IST conversion

export const formatToIST = (dateTime: string | Date) => {
  const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
  
  // Convert to IST (UTC+5:30)
  const istOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  
  return new Intl.DateTimeFormat('en-IN', istOptions).format(date);
};

export const formatToISTTime = (dateTime: string | Date) => {
  const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
  
  // Convert to IST time only
  const istOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  
  return new Intl.DateTimeFormat('en-IN', istOptions).format(date);
};

export const formatToISTDate = (dateTime: string | Date) => {
  const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
  
  // Convert to IST date only
  const istOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  
  return new Intl.DateTimeFormat('en-IN', istOptions).format(date);
};

export const formatToISTTimeOnly = (dateTime: string | Date) => {
  const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
  
  // Convert to IST time with 12-hour format
  const istOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  
  return new Intl.DateTimeFormat('en-IN', istOptions).format(date);
};

export const formatToISTDateTime = (dateTime: string | Date) => {
  const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
  
  const istDateOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  const istTimeOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  
  const dateStr = new Intl.DateTimeFormat('en-IN', istDateOptions).format(date);
  const timeStr = new Intl.DateTimeFormat('en-IN', istTimeOptions).format(date);
  
  return {
    date: dateStr,
    time: timeStr,
    full: `${dateStr} at ${timeStr}`
  };
};

export const getCurrentISTTime = () => {
  return formatToIST(new Date());
};

export const getISTHour = (dateTime: string | Date) => {
  const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
  
  // Get hour in IST
  const istOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    hour12: false
  };
  
  return parseInt(new Intl.DateTimeFormat('en-IN', istOptions).format(date));
};