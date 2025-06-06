import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { API_ENDPOINTS } from '../../config/api';
import { decodeJWT } from '../../utils/jwt';
import './index.css';

const TripsPanel = ({ isOpen, onClose }) => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTrips = async () => {
            if (!isOpen) return;

            const token = sessionStorage.getItem('authToken');
            if (!token) {
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
                    sessionStorage.removeItem('authToken');
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
        navigate(`/map/${tripId}`);
        onClose();
    };

    return (
        <div className={`trips-panel ${isOpen ? 'open' : ''}`}>
            <div className="trips-header">
                <h2>Mes Voyages</h2>
                <button className="close-button" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>
            </div>
            <div className="trips-content">
                {loading ? (
                    <div className="loading">Chargement...</div>
                ) : error ? (
                    <div className="error">{error}</div>
                ) : trips.length === 0 ? (
                    <div className="no-trips">Aucun voyage trouvé</div>
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
                                <i className="fas fa-chevron-right"></i>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TripsPanel; 