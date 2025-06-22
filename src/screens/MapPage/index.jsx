import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import Sidebar from '../../components/Sidebar';
import Map from '../../components/Map';
import CreateTripPopup from '../../components/CreateTripPopup';
import AddStopPopup from '../../components/AddStopPopup';
import { API_ENDPOINTS } from '../../config/api';
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

    const fetchSteps = async () => {
        if (!tripId) {
            setSteps([]);
            return;
        }
        setIsLoadingSteps(true);
        const token = sessionStorage.getItem('authToken');
        try {
            const response = await fetch(API_ENDPOINTS.GET_STEPS_BY_TRIP(tripId), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
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

    const handleStepClick = (location) => {
        if (!location) return;
        const [lat, lng] = location.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
            setFlyToCoords([lng, lat]);
        }
    };

    useEffect(() => {
        fetchSteps();
    }, [tripId]);

    const handleAddStopSubmit = async (formData) => {
        if (!tripId || !selectedPoi) return;

        const token = sessionStorage.getItem('authToken');
        if (!token) {
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

    return (
        <div className="map-container">
            <Sidebar 
                setIsCreateTripOpen={setIsCreateTripOpen} 
                steps={steps}
                isLoadingSteps={isLoadingSteps}
                onStepClick={handleStepClick}
            />
            <Map 
                setIsCreateTripOpen={setIsCreateTripOpen}
                setIsAddStopPopupOpen={setIsAddStopPopupOpen}
                setSelectedPoi={setSelectedPoi}
                steps={steps}
                flyToCoords={flyToCoords}
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