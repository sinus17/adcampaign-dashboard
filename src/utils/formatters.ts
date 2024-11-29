import { format, formatDistanceToNow } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { de } from 'date-fns/locale';

const TIMEZONE = 'Europe/Berlin';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('de-DE').format(value);
};

export const formatPercent = (value: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export const formatDateTime = (date: string | Date): string => {
  return formatInTimeZone(
    date,
    TIMEZONE,
    "dd.MM.yyyy 'um' HH:mm 'Uhr'",
    { locale: de }
  );
};

export const formatDate = (date: string | Date): string => {
  return formatInTimeZone(
    date,
    TIMEZONE,
    'dd.MM.yyyy',
    { locale: de }
  );
};