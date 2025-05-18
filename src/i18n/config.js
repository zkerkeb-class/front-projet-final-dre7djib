import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      hero: {
        title: 'Turn your road trip',
        titleh1: 'into an',
        titleSpan: 'adventure',
        subtitle: 'Find all the best stops at your destination and along the way.',
        explore: 'Not sure where to go?',
        exploreLink: 'Explore the map'
      },
      nav: {
        about: 'About',
        start: 'Start',
        contact: 'Contact'
      }
    }
  },
  fr: {
    translation: {
      hero: {
        title: 'Transforme ton voyage',
        titleh1: 'en une',
        titleSpan: 'composition',
        subtitle: 'Trouve les meilleurs arrêts à ta destination et tout au long de ton parcours.',
        explore: 'Pas sûr où aller ?',
        exploreLink: 'Explorer la carte'
      },
      nav: {
        about: 'À propos',
        start: 'Démarrer',
        contact: 'Contact'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;