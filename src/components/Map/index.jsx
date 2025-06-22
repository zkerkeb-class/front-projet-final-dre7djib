import { React, useRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import "./index.css";

mapboxgl.accessToken = 'pk.eyJ1IjoiZHJlN2RqaWIiLCJhIjoiY21hdG1kMmQwMDRucDJpcjc3aHIyd2xzNiJ9.JPVjlUEWyuQL090d0FyzfQ';

const Map = ({ setIsCreateTripOpen, setIsAddStopPopupOpen, setSelectedPoi, steps, flyToCoords }) => {
    const { t } = useTranslation();
    const { id: tripId } = useParams();
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);
    const [mapInitialized, setMapInitialized] = useState(false);
    const popupRef = useRef(null);
    const geocoderRef = useRef(null);
    const stepMarkersRef = useRef([]);

    useEffect(() => {
        if (mapRef.current && mapInitialized) {
            stepMarkersRef.current.forEach(marker => marker.remove());
            stepMarkersRef.current = [];

            if (steps && steps.length > 0) {
                const newMarkers = steps.map(step => {
                    if (!step.location) return null;
                    const [lat, lng] = step.location.split(',').map(Number);
                    if (isNaN(lat) || isNaN(lng)) return null;

                    const marker = new mapboxgl.Marker()
                        .setLngLat([lng, lat])
                        .addTo(mapRef.current);
                    return marker;
                }).filter(Boolean);
                
                stepMarkersRef.current = newMarkers;

                if (newMarkers.length > 0) {
                    const bounds = new mapboxgl.LngLatBounds();
                    newMarkers.forEach(marker => {
                        bounds.extend(marker.getLngLat());
                    });
                    mapRef.current.fitBounds(bounds, { padding: 100, duration: 0 });
                }
            }
        }
    }, [steps, mapInitialized]);

    useEffect(() => {
        if (mapRef.current && mapInitialized && flyToCoords) {
            mapRef.current.flyTo({
                center: flyToCoords,
                zoom: 15,
                speed: 1.2
            });
        }
    }, [flyToCoords]);

    const getInitialMapState = () => {
        const savedState = localStorage.getItem('mapState');
        return savedState ? JSON.parse(savedState) : {
            center: [2.3522, 48.8566],
            zoom: 12
        };
    };

    useEffect(() => {
        if (!mapInitialized && mapContainerRef.current && !mapRef.current) {
            const initialState = getInitialMapState();
            
            mapRef.current = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                projection: 'globe',
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

                const layers = mapRef.current.getStyle().layers;

                setupPOIInteractions(layers);
                setMapInitialized(true);
            });

            mapRef.current.on('moveend', () => {
                if (mapRef.current.isMoving()) return;
                const center = mapRef.current.getCenter().toArray();
                const zoom = mapRef.current.getZoom();
                localStorage.setItem('mapState', JSON.stringify({ center, zoom }));
                
                geocoderRef.current.setProximity({
                    longitude: center[0],
                    latitude: center[1]
                });
            });
            
            geocoderRef.current = new MapboxGeocoder({
                accessToken: mapboxgl.accessToken,
                mapboxgl: mapboxgl,
                placeholder: t('map.searchPlaceholder'),
                types: 'country,region,place,postcode,locality,neighborhood,address,poi',
                marker: {
                    color: '#1a237e'
                },
                proximity: {
                    longitude: initialState.center[0],
                    latitude: initialState.center[1]
                }
            });

            mapRef.current.addControl(geocoderRef.current);
            mapRef.current.addControl(new mapboxgl.NavigationControl());
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                geocoderRef.current = null;
                setMapInitialized(false);
            }
        };
    }, []);

    useEffect(() => {
        if (geocoderRef.current) {
            geocoderRef.current.setPlaceholder(t('map.searchPlaceholder'));
        }
    }, [t]);

    const setupPOIInteractions = (layers) => {
        const poiLayers = layers
            .filter(layer => layer.id.includes('poi') || 
                           layer.id.includes('place') || 
                           layer.id.includes('landmark'))
            .map(layer => layer.id);


        mapRef.current.on('mousemove', (e) => {
            const features = mapRef.current.queryRenderedFeatures(e.point, {
                layers: poiLayers
            });

            mapRef.current.getCanvas().style.cursor = features.length ? 'pointer' : '';
        });

        mapRef.current.on('click', (e) => {
            const features = mapRef.current.queryRenderedFeatures(e.point, {
                layers: poiLayers
            });

            if (features.length > 0) {
                const place = features[0];

                const name = place.properties.name || 'Lieu sans nom';
                const category = place.properties.category_en || 'Non catégorisé';

                if (popupRef.current) {
                    popupRef.current.remove();
                }

                const popupContent = document.createElement('div');
                popupContent.className = 'poi-popup-container';
                popupContent.innerHTML = `
                    <h3>${name}</h3>
                    <div class="poi-category-info">
                        <i class="fas fa-campground"></i>
                        <span>${category}</span>
                    </div>
                    <hr class="popup-divider" />
                    <div class="poi-actions">
                        <div class="action">
                            <button class="action-icon add-stop" id="popup-add-stop">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 5V19M5 12H19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                            <span class="action-label">Add stop</span>
                        </div>
                    </div>
                `;

                popupContent.querySelector('#popup-add-stop').addEventListener('click', () => {
                    popupRef.current.remove();
                    if (tripId) {
                        setSelectedPoi(place);
                        setIsAddStopPopupOpen(true);
                    } else {
                        setIsCreateTripOpen(true);
                    }
                });

                popupRef.current = new mapboxgl.Popup({ closeButton: false, offset: 25 })
                    .setLngLat(e.lngLat)
                    .setDOMContent(popupContent)
                    .addTo(mapRef.current);
            }
        });
    };

    return (
        <div className='map'>
            <div id='map-container' ref={mapContainerRef} />
        </div>
    );
};

export default Map;