import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date, formatStr = 'MMM d, yyyy') => {
  return format(new Date(date), formatStr);
};

export const formatDateTime = (date) => {
  return format(new Date(date), 'MMM d, yyyy HH:mm');
};

export const formatTimeAgo = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num);
};

