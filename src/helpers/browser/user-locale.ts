const locale = navigator.languages ? navigator.languages[0] : (navigator.language || (navigator as any).userLanguage) as string;

export default locale;
