import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './ru.json';
import kz from './kz.json';

const resources = {
  ru: { translation: ru },
  kz: { translation: kz },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'kz',
    fallbackLng: 'ru',
    interpolation: { escapeValue: false },
  });

export default i18n;
