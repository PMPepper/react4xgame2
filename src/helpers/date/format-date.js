import defaultLocale from '@/helpers/browser/user-locale';

export default function formatDate(date, langCode, format = null) {
  date = date instanceof Date ? date : new Date(date);
  let options = null;

  if(typeof(format) === 'object') {
    options = format;
  } else {
    switch(format) {
      case 'long':
        options = {
          weekday: 'long',
          month: 'long'
        };
        break;
      case 'date':
        options = {
          year: 'numeric',
          month: 'short',
          day: '2-digit'
        };
        break;
      case 'shortDate':
        options = {
          year: '2-digit',
          month: 'short',
          day: '2-digit'
        };
        break;
      case 'datetime':
        options = {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        };
        break;
      case 'day':
        options = {
          weekday: 'short',
          month: '2-digit',
          day: '2-digit',
        };
        break;
      case 'dayOfMonth':
        options = {
          month: 'short',
          day: '2-digit',
        };
        break;
      case 'weekday':
        options = {
          weekday: 'short',
        };
        break;
      case 'month':
        options = {
          year: 'numeric',
          month: 'long',
        };
        break;
      case 'dateHourMin':
        options = {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        };
        break;
      case 'time':
        options = {
          hour: '2-digit',
          minute: '2-digit'
        };
        break;
      case null:
        options = null;
        break;
      default:
        throw new Error('formatDate:: invalid format: ' + format);
    }
  }

  return date.toLocaleString(langCode || defaultLocale, options || undefined)
}
