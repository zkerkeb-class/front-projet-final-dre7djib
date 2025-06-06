import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import CreateTripPopup from '../CreateTripPopup';
import TripsPanel from '../TripsPanel';
import './index.css';
import { API_ENDPOINTS } from '../../config/api';

const Sidebar = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [isItineraryOpen, setIsItineraryOpen] = useState(false);
    const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);
    const [isTripsOpen, setIsTripsOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: ''
    });
    const [errors, setErrors] = useState({});

    const isActive = (path) => {
        return location.pathname === path;
    };

    const closeAllPanels = () => {
        setIsItineraryOpen(false);
        setIsTripsOpen(false);
    };

    const handleMapClick = (e) => {
        closeAllPanels();
    };

    const handleItineraryClick = (e) => {
        e.preventDefault();
        setIsItineraryOpen(true);
        setIsTripsOpen(false);
    };

    const handleTripsClick = (e) => {
        e.preventDefault();
        setIsTripsOpen(true);
        setIsItineraryOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) {
            newErrors.title = 'Le titre est requis';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'La description est requise';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleStartTrip = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        const token = sessionStorage.getItem('authToken');
        
        if (!token) {
            console.error('Non authentifié');
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(API_ENDPOINTS.TRAVEL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            if (response.status === 401) {
                sessionStorage.removeItem('authToken');
                navigate('/login');
                return;
            }

            if (!response.ok) {
                throw new Error('Erreur lors de la création du voyage');
            }

            const data = await response.json();
            setIsCreateTripOpen(false);
            setFormData({
                title: '',
                description: '',
                startDate: '',
                endDate: ''
            });
            navigate(`/map/${data.id}`);
        } catch (error) {
            console.error('Erreur:', error);
        }
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
                    className={`sidebar-item create-trip ${isActive('/start-trip') ? 'active' : ''}`}
                    onClick={(e) => {
                        e.preventDefault();
                        setIsCreateTripOpen(true);
                    }}
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
                    {/* TODO Content*/}
                </div>
            </div>

            {(isItineraryOpen || isTripsOpen) && (
                <div className="overlay" onClick={closeAllPanels}></div>
            )}

            <CreateTripPopup 
                isOpen={isCreateTripOpen}
                onClose={() => setIsCreateTripOpen(false)}
            />

            <TripsPanel
                isOpen={isTripsOpen}
                onClose={() => setIsTripsOpen(false)}
            />
        </>
    );
};

export default Sidebar;