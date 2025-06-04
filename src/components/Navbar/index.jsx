import React, { useState, useEffect } from 'react';
import { Outlet, Link } from "react-router";
import { useTranslation } from 'react-i18next';
import './index.css';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const checkAuth = () => {
      const token = sessionStorage.getItem('authToken');
      setIsAuthenticated(!!token);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const handleHamburgerClick = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('navbar_overlay')) {
      setMenuOpen(false);
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const renderNavLinks = () => (
    <>
      {!isAuthenticated && <li><Link to="/login" onClick={handleLinkClick}>{t('nav.about')}</Link></li>}
      {isAuthenticated && <li><Link to="/profile" onClick={handleLinkClick}>{t('nav.profile')}</Link></li>}
      <li><Link to="/map" onClick={handleLinkClick}>{t('nav.start')}</Link></li>
      <li><Link to="/contact" onClick={handleLinkClick}>{t('nav.contact')}</Link></li>
    </>
  );

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar_logo">
          <Link to="/">
            <h3>PLANO.</h3>
          </Link>
        </div>
        <div className="navbar_hamburger" onClick={handleHamburgerClick}>
          <div className={menuOpen ? "bar open" : "bar"}></div>
          <div className={menuOpen ? "bar open" : "bar"}></div>
          <div className={menuOpen ? "bar open" : "bar"}></div>
        </div>
        {menuOpen && (
          <div className="navbar_overlay" onClick={handleOverlayClick}>
            <ul className={menuOpen ? "navbar_links open" : "navbar_links"}>
              {renderNavLinks()}
            </ul>
          </div>
        )}
        <ul className={!menuOpen ? "navbar_links" : "navbar_links desktop-hide"}>
          {renderNavLinks()}
          <li className="language-selector">
            <button 
              className={i18n.language === 'en' ? 'active' : ''} 
              onClick={() => changeLanguage('en')}
            >
              EN
            </button>
            <button 
              className={i18n.language === 'fr' ? 'active' : ''} 
              onClick={() => changeLanguage('fr')}
            >
              FR
            </button>
          </li>
        </ul>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Navbar;