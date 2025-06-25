import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import TripsPanel from '../TripsPanel';
import RoutePreferences from '../RoutePreferences';
import './index.css';

const Sidebar = ({ setIsCreateTripOpen = () => {}, steps, isLoadingSteps, onStepClick, tripInfo, onPreferencesChange, userPreferences }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const { id: tripId } = useParams();
    const [isItineraryOpen, setIsItineraryOpen] = useState(false);
    const [isTripsOpen, setIsTripsOpen] = useState(false);
    const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

    const isActive = (path) => {
        return location.pathname === path;
    };

    const closeAllPanels = () => {
        setIsItineraryOpen(false);
        setIsTripsOpen(false);
        setIsPreferencesOpen(false);
    };

    const handleMapClick = () => {
        closeAllPanels();
    };

    const handleItineraryClick = (e) => {
        e.preventDefault();
        if (tripId) {
            setIsItineraryOpen(!isItineraryOpen);
        setIsTripsOpen(false);
        }
    };

    const handleTripsClick = (e) => {
        e.preventDefault();
        setIsTripsOpen(true);
        setIsItineraryOpen(false);
        setIsPreferencesOpen(false);
    };

    const handlePreferencesClick = (e) => {
        e.preventDefault();
        setIsPreferencesOpen(true);
        setIsItineraryOpen(false);
        setIsTripsOpen(false);
    };

    const handleCreateTripClick = (e) => {
        e.preventDefault();
        if (!tripId) {
            setIsCreateTripOpen(true);
        }
    };

    return (
        <>
            <div className="sidebar">
                <a 
                    href="#" 
                    className={`sidebar-item ${isItineraryOpen ? 'active' : ''} ${!tripId ? 'disabled' : ''}`}
                    onClick={handleItineraryClick}
                >
                    <i className="fas fa-list"></i>
                    <span>{t('sidebar.itinerary')}</span>
                </a>

                <a 
                    href="#" 
                    className={`sidebar-item ${isTripsOpen ? 'active' : ''}`}
                    onClick={handleTripsClick}
                >
                    <i className="fas fa-suitcase"></i>
                    <span>{t('sidebar.myTrips')}</span>
                </a>

                <a 
                    href="#" 
                    className={`sidebar-item ${isPreferencesOpen ? 'active' : ''}`}
                    onClick={handlePreferencesClick}
                >
                    <i className="fas fa-cog"></i>
                    <span>{t('sidebar.preferences') || 'Préférences'}</span>
                </a>

                <a 
                    href="#" 
                    className={`sidebar-item create-trip ${tripId ? 'disabled' : ''}`}
                    onClick={handleCreateTripClick}
                >
                    <i className="fas fa-plus"></i>
                    <span>{t('sidebar.startTrip')}</span>
                </a>
            </div>

            <div className={`itinerary-panel ${isItineraryOpen ? 'open' : ''}`}>
                <div className="itinerary-header">
                    <h2>{tripInfo?.title || t('sidebar.itinerary')}</h2>
                    <button className="close-button" onClick={() => setIsItineraryOpen(false)}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="itinerary-content">
                    {isLoadingSteps ? (
                        <p>{t('sidebar.loadingSteps')}</p>
                    ) : steps.length > 0 ? (
                        <ul className="steps-list">
                            {steps.map((step, index) => (
                                <li key={step.id} className="step-item" onClick={() => onStepClick(step.location)}>
                                    <h3>{index + 1} - {step.title}</h3>
                                    <p>{step.description}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>{t('sidebar.noSteps')}</p>
                    )}
                </div>
            </div>

            <div className={`preferences-panel ${isPreferencesOpen ? 'open' : ''}`}>
                <div className="preferences-header">
                    <h2>{t('sidebar.preferences') || 'Préférences'}</h2>
                    <button className="close-button" onClick={() => setIsPreferencesOpen(false)}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="preferences-content">
                    <RoutePreferences 
                        isVisible={isPreferencesOpen}
                        onToggle={(showRoutes) => {
                        }}
                        onPreferencesChange={onPreferencesChange}
                        initialPreferences={userPreferences}
                    />
                </div>
            </div>

            {(isItineraryOpen || isTripsOpen || isPreferencesOpen) && (
                <div className="overlay" onClick={closeAllPanels}></div>
            )}

            <TripsPanel
                isOpen={isTripsOpen}
                onClose={() => setIsTripsOpen(false)}
            />
        </>
    );
};

export default Sidebar;