import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Map from "../../components/Map";
import './index.css';

const MapPage = () => {
    const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);

    return (
    <div className="map-container">
        <Sidebar 
            isCreateTripOpen={isCreateTripOpen}
            setIsCreateTripOpen={setIsCreateTripOpen}
        />
        <Map isCreateTripOpen={isCreateTripOpen} />
    </div>
    )
}

export default MapPage;