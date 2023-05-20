import defaultLocale from 'helpers/browser/user-locale';

type DateLike = Date | number | string;
export type DateFormatType = Intl.DateTimeFormatOptions | 'long' | 'date' | 'shortDate' | 'datetime' | 'day' | 'dayOfMonth' | 'weekday' | 'month' | 'dateHourMin' | 'time'

export default function formatDate(date: DateLike, langCode?: Intl.LocalesArgument, format?: DateFormatType) {
  let options: Intl.DateTimeFormatOptions | undefined;

  if(typeof(format) !== 'string') {
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
      default:
        throw new Error('formatDate:: invalid format: ' + format);
    }
  }

  return (date instanceof Date ? date : new Date(date)).toLocaleString(langCode || defaultLocale, options)
}
