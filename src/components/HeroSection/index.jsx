import React from 'react';
import { useTranslation } from 'react-i18next';
import './index.css';
import heroImage from '../../../public/hero-image.png';

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          {t('hero.title')}<br />
          {t('hero.titleh1')} <span className="underline">{t('hero.titleSpan')}</span>
        </h1>
        <p className="hero-subtitle">
          {t('hero.subtitle')}
        </p>
        <div className="explore-map">
          <p>{t('hero.explore')} <a href="/map">{t('hero.exploreLink')} <span>→</span></a></p>
        </div>
      </div>
      <div className="hero-image">
        <img src={heroImage} alt="Interface de carte interactive" />
      </div>
    </div>
  );
};

export default HeroSection;