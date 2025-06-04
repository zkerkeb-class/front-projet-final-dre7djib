import { React, useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';
import "./index.css";

mapboxgl.accessToken = 'pk.eyJ1IjoiZHJlN2RqaWIiLCJhIjoiY21hdG1kMmQwMDRucDJpcjc3aHIyd2xzNiJ9.JPVjlUEWyuQL090d0FyzfQ';

const Map = () => {
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);
    const [mapInitialized, setMapInitialized] = useState(false);

    const getInitialMapState = () => {
        const savedState = localStorage.getItem('mapState');
        return savedState ? JSON.parse(savedState) : {
            center: [2.3522, 48.8566], // Paris
            zoom: 12
        };
    };

    useEffect(() => {
        if (!mapInitialized && mapContainerRef.current && !mapRef.current) {
            const initialState = getInitialMapState();
            
            mapRef.current = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: initialState.center,
                zoom: initialState.zoom
            });

            mapRef.current.on('style.load', () => {
                mapRef.current.addSource('mapbox-dem', {
                    type: 'raster-dem',
                    url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
                    tileSize: 512,
                    maxzoom: 14
                });
                mapRef.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
            });

            mapRef.current.on('moveend', () => {
                const center = mapRef.current.getCenter().toArray();
                const zoom = mapRef.current.getZoom();
                localStorage.setItem('mapState', JSON.stringify({ center, zoom }));
            });
            
            mapRef.current.addControl(new mapboxgl.NavigationControl());
            setMapInitialized(true);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                setMapInitialized(false);
            }
        };
    }, []);

    return (
        <div id='map-container' ref={mapContainerRef} />
    );
};

export default Map;