import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import Sidebar from '../../components/Sidebar';
import Map from '../../components/Map';
import CreateTripPopup from '../../components/CreateTripPopup';
import AddStopPopup from '../../components/AddStopPopup';
import { API_ENDPOINTS } from '../../config/api';
import { decodeJWT, isTokenExpired, clearExpiredToken } from '../../utils/jwt';
import './index.css';

const MapPage = () => {
    const { id: tripId } = useParams();
    const navigate = useNavigate();
    const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);
    const [isAddStopPopupOpen, setIsAddStopPopupOpen] = useState(false);
    const [selectedPoi, setSelectedPoi] = useState(null);
    const [steps, setSteps] = useState([]);
    const [isLoadingSteps, setIsLoadingSteps] = useState(false);
    const [flyToCoords, setFlyToCoords] = useState(null);
    const [tripInfo, setTripInfo] = useState(null);
    const [userPreferences, setUserPreferences] = useState(null);
    const [isPreferencesLoaded, setIsPreferencesLoaded] = useState(false);

    const fetchSteps = async () => {
        if (!tripId) {
            setSteps([]);
            return;
        }
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

        setIsLoadingSteps(true);
        try {
            const response = await fetch(`${API_ENDPOINTS.GET_STEPS_BY_TRIP(tripId)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.status === 401) {
                clearExpiredToken();
                navigate('/login');
                return;
            }
            
            if (response.ok) {
                const data = await response.json();
                setSteps(data);
            } else {
                setSteps([]);
            }
        } catch (error) {
            console.error("Error fetching steps:", error);
            setSteps([]);
        } finally {
            setIsLoadingSteps(false);
        }
    };

    const fetchTripInfo = async () => {
        if (!tripId) {
            setTripInfo(null);
            return;
        }
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
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.status === 401) {
                clearExpiredToken();
                navigate('/login');
                return;
            }
            
            if (response.ok) {
                const data = await response.json();
                setTripInfo(data);
            } else {
                setTripInfo(null);
            }
        } catch (error) {
            console.error("Error fetching trip info:", error);
            setTripInfo(null);
        }
    };

    const fetchUserPreferences = async () => {
        const token = sessionStorage.getItem('authToken');
        
        if (!token) {
            setIsPreferencesLoaded(true);
            return;
        }

        if (isTokenExpired(token)) {
            clearExpiredToken();
            navigate('/login');
            return;
        }

        try {
            const decodedToken = decodeJWT(token);
            
            if (!decodedToken?.sub) {
                setIsPreferencesLoaded(true);
                return;
            }

            const response = await fetch(API_ENDPOINTS.GET_USER_PREFERENCES(decodedToken.sub), {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                clearExpiredToken();
                navigate('/login');
                return;
            }

            if (response.ok) {
                const data = await response.json();
                
                const preferences = data.routePreferences || {
                    showRoutes: false,
                    defaultTransportMode: 'driving',
                    autoShowRoutes: false
                };
                
                setUserPreferences(preferences);
            } else {
                const defaultPreferences = {
                    showRoutes: false,
                    defaultTransportMode: 'driving',
                    autoShowRoutes: false
                };
                setUserPreferences(defaultPreferences);
            }
        } catch (error) {
            console.error("Error fetching user preferences:", error);
            const defaultPreferences = {
                showRoutes: false,
                defaultTransportMode: 'driving',
                autoShowRoutes: false
            };
            setUserPreferences(defaultPreferences);
        } finally {
            setIsPreferencesLoaded(true);
        }
    };

    const handleStepClick = (location) => {
        if (!location) return;
        const [lat, lng] = location.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
            setFlyToCoords([lng, lat]);
        }
    };

    useEffect(() => {
        fetchSteps();
        fetchTripInfo();
        fetchUserPreferences();
    }, [tripId]);

    const handleAddStopSubmit = async (formData) => {
        if (!tripId || !selectedPoi) return;

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

        const [longitude, latitude] = selectedPoi.geometry.coordinates;
        const locationString = `${latitude},${longitude}`;

        const payload = {
            ...formData,
            travel_id: tripId,
            location: locationString,
        };

        try {
            const response = await fetch(API_ENDPOINTS.STEP, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.status === 401) {
                clearExpiredToken();
                navigate('/login');
                return;
            }

            if (response.ok) {
                setIsAddStopPopupOpen(false);
                fetchSteps();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to add stop");
            }
        } catch (error) {
            console.error("Error adding stop:", error);
        }
    };

    const handlePreferencesChange = (newPreferences) => {
        setUserPreferences(newPreferences);
    };

    return (
        <div className="map-container">
            <Sidebar 
                setIsCreateTripOpen={setIsCreateTripOpen} 
                steps={steps}
                isLoadingSteps={isLoadingSteps}
                onStepClick={handleStepClick}
                tripInfo={tripInfo}
                onPreferencesChange={handlePreferencesChange}
                userPreferences={userPreferences}
            />
            <Map 
                setIsCreateTripOpen={setIsCreateTripOpen}
                setIsAddStopPopupOpen={setIsAddStopPopupOpen}
                setSelectedPoi={setSelectedPoi}
                steps={steps}
                flyToCoords={flyToCoords}
                userPreferences={userPreferences}
                isPreferencesLoaded={isPreferencesLoaded}
                tripId={tripId}
            />
            <CreateTripPopup
                isOpen={isCreateTripOpen}
                onClose={() => setIsCreateTripOpen(false)}
            />
            <AddStopPopup 
                isOpen={isAddStopPopupOpen}
                onClose={() => setIsAddStopPopupOpen(false)}
                poi={selectedPoi}
                onAddStop={handleAddStopSubmit}
            />
        </div>
    );
};

export default MapPage;