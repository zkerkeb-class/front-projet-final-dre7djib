import React from "react";
import Sidebar from "../../components/Sidebar";
import Map from "../../components/Map";
import './index.css';

const MapPage = () => {
    return (
    <div className="map-container">
        <Sidebar />
        <Map />
    </div>
    )
}

export default MapPage;