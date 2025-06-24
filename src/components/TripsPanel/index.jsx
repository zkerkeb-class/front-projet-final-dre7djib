import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../../config/api';
import { decodeJWT, isTokenExpired, clearExpiredToken } from '../../utils/jwt';
import './index.css';

const TripsPanel = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingTripId, setDeletingTripId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTrips = async () => {
            if (!isOpen) return;

            const token = sessionStorage.getItem('authToken');
            if (!token) {
                navigate('/login');
                return;
            }

            if (isTokenExpired(token)) {
                clearExpiredToken();
                navigate('/login');
                return;
            }

            const decodedToken = decodeJWT(token);
            if (!decodedToken || !decodedToken.sub) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch(`${API_ENDPOINTS.TRAVEL}/user/${decodedToken.sub}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 401) {
                    clearExpiredToken();
                    navigate('/login');
                    return;
                }

                if (!response.ok) {
                    throw new Error('Failed to fetch trips');
                }

                const data = await response.json();
                setTrips(data);
            } catch (error) {
                console.error('Error fetching trips:', error);
                setError('Failed to load trips');
            } finally {
                setLoading(false);
            }
        };

        fetchTrips();
    }, [isOpen, navigate]);

    const handleTripClick = (tripId) => {
        if (!tripId) {
            console.error('Trip ID is undefined!');
            return;
        }
        navigate(`/map/${tripId}`);
        onClose();
    };

    const handleDeleteTrip = async (tripId, event) => {
        event.stopPropagation();
        
        if (!window.confirm(t('trips.deleteConfirmation') || 'Êtes-vous sûr de vouloir supprimer ce voyage ?')) {
            return;
        }

        setDeletingTripId(tripId);
        
        const token = sessionStorage.getItem('authToken');
        if (!token) {
            navigate('/login');
            return;
        }

        if (isTokenExpired(token)) {
            clearExpiredToken();
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_ENDPOINTS.TRAVEL}/${tripId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                clearExpiredToken();
                navigate('/login');
                return;
            }

            if (response.ok) {
                setTrips(prevTrips => prevTrips.filter(trip => trip.id !== tripId));
            } else {
                console.error('Failed to delete trip');
                alert(t('trips.deleteError') || 'Erreur lors de la suppression du voyage');
            }
        } catch (error) {
            console.error('Error deleting trip:', error);
            alert(t('trips.deleteError') || 'Erreur lors de la suppression du voyage');
        } finally {
            setDeletingTripId(null);
        }
    };

    return (
        <div className={`trips-panel ${isOpen ? 'open' : ''}`}>
            <div className="trips-header">
                <h2>{t('trips.title') || 'Mes Voyages'}</h2>
                <button className="close-button" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>
            </div>
            <div className="trips-content">
                {loading ? (
                    <div className="loading">{t('trips.loading') || 'Chargement...'}</div>
                ) : error ? (
                    <div className="error">{error}</div>
                ) : trips.length === 0 ? (
                    <div className="no-trips">{t('trips.noTrips') || 'Aucun voyage trouvé'}</div>
                ) : (
                    <div className="trips-list">
                        {trips.map((trip) => (
                            <div
                                key={trip.id}
                                className="trip-item"
                                onClick={() => handleTripClick(trip.id)}
                            >
                                <div className="trip-info">
                                    <h3>{trip.title}</h3>
                                    <p>{trip.description}</p>
                                    {trip.startDate && (
                                        <div className="trip-dates">
                                            <span>
                                                {new Date(trip.startDate).toLocaleDateString()}
                                            </span>
                                            {trip.endDate && (
                                                <>
                                                    <span> - </span>
                                                    <span>
                                                        {new Date(trip.endDate).toLocaleDateString()}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="trip-actions">
                                    <button
                                        className="delete-trip-btn"
                                        onClick={(e) => handleDeleteTrip(trip.id, e)}
                                        disabled={deletingTripId === trip.id}
                                        title={t('trips.delete') || 'Supprimer'}
                                    >
                                        {deletingTripId === trip.id ? (
                                            <i className="fas fa-spinner fa-spin"></i>
                                        ) : (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        )}
                                    </button>
                                    <i className="fas fa-chevron-right"></i>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TripsPanel; 