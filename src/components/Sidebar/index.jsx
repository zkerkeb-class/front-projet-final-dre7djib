import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import TripsPanel from '../TripsPanel';
import './index.css';

const Sidebar = ({ setIsCreateTripOpen = () => {}, steps, isLoadingSteps, onStepClick }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const { id: tripId } = useParams();
    const [isItineraryOpen, setIsItineraryOpen] = useState(false);
    const [isTripsOpen, setIsTripsOpen] = useState(false);

    const isActive = (path) => {
        return location.pathname === path;
    };

    const closeAllPanels = () => {
        setIsItineraryOpen(false);
        setIsTripsOpen(false);
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
                    className={`sidebar-item create-trip ${tripId ? 'disabled' : ''}`}
                    onClick={handleCreateTripClick}
                >
                    <i className="fas fa-plus"></i>
                    <span>{t('sidebar.startTrip')}</span>
                </a>
            </div>

            <div className={`itinerary-panel ${isItineraryOpen ? 'open' : ''}`}>
                <div className="itinerary-header">
                    <h2>{t('sidebar.itinerary')}</h2>
                    <button className="close-button" onClick={() => setIsItineraryOpen(false)}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="itinerary-content">
                    {isLoadingSteps ? (
                        <p>Loading steps...</p>
                    ) : steps.length > 0 ? (
                        <ul className="steps-list">
                            {steps.map(step => (
                                <li key={step.id} className="step-item" onClick={() => onStepClick(step.location)}>
                                    <h3>{step.title}</h3>
                                    <p>{step.description}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No steps in this trip yet.</p>
                    )}
                </div>
            </div>

            {(isItineraryOpen || isTripsOpen) && (
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