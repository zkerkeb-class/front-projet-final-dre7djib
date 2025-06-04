import React, { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import './index.css';

const Sidebar = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const [isItineraryOpen, setIsItineraryOpen] = useState(false);

    const isActive = (path) => {
        return location.pathname === path;
    };

    const handleMapClick = (e) => {
        if (isItineraryOpen) {
            setIsItineraryOpen(false);
        }
    };

    const handleItineraryClick = (e) => {
        e.preventDefault();
        setIsItineraryOpen(true);
    };

    return (
        <>
            <div className="sidebar">
                <Link 
                    to="/map" 
                    className={`sidebar-item ${isActive('/map') ? 'active' : ''}`}
                    onClick={handleMapClick}
                >
                    <i className="fas fa-map"></i>
                    <span>{t('sidebar.map')}</span>
                </Link>

                <a 
                    href="#" 
                    className={`sidebar-item ${isItineraryOpen ? 'active' : ''}`}
                    onClick={handleItineraryClick}
                >
                    <i className="fas fa-list"></i>
                    <span>{t('sidebar.itinerary')}</span>
                </a>

                <Link to="/my-trips" className={`sidebar-item ${isActive('/my-trips') ? 'active' : ''}`}>
                    <i className="fas fa-suitcase"></i>
                    <span>{t('sidebar.myTrips')}</span>
                </Link>

                <Link to="/start-trip" className={`sidebar-item create-trip ${isActive('/start-trip') ? 'active' : ''}`}>
                    <i className="fas fa-plus"></i>
                    <span>{t('sidebar.startTrip')}</span>
                </Link>
            </div>

            <div className={`itinerary-panel ${isItineraryOpen ? 'open' : ''}`}>
                <div className="itinerary-header">
                    <h2>{t('sidebar.itinerary')}</h2>
                    <button className="close-button" onClick={() => setIsItineraryOpen(false)}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="itinerary-content">
                    {/* TODO Content*/}
                </div>
            </div>

            {isItineraryOpen && <div className="overlay" onClick={() => setIsItineraryOpen(false)}></div>}
        </>
    );
};

export default Sidebar;