import { React, useRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import * as turf from '@turf/turf';
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
    const routeLineRef = useRef(null);
    const airplaneAnimationRef = useRef(null);
    const airplanePointRef = useRef(null);
    const airplaneRouteRef = useRef(null);
    const animationCounterRef = useRef(0);
    const animationRunningRef = useRef(false);
    const routeCounterRef = useRef(0);
    const activeRoutesRef = useRef(new window.Map());

    const fetchRoute = async (startCoords, endCoords, transportMode = 'driving', routeKey) => {
        try {
            const routeId = routeKey || `route-${routeCounterRef.current++}`;
            const airplaneId = `airplane-${routeId}`;

            if (mapRef.current.getLayer(routeId)) {
                mapRef.current.removeLayer(routeId);
            }
            if (mapRef.current.getSource(routeId)) {
                mapRef.current.removeSource(routeId);
            }
            if (mapRef.current.getLayer(airplaneId)) {
                mapRef.current.removeLayer(airplaneId);
            }
            if (mapRef.current.getSource(airplaneId)) {
                mapRef.current.removeSource(airplaneId);
            }

            let routeGeometry;

            if (transportMode === 'flying') {
                const startLngLat = Array.isArray(startCoords) ? startCoords : [startCoords[0], startCoords[1]];
                const endLngLat = Array.isArray(endCoords) ? endCoords : [endCoords[0], endCoords[1]];
                
                routeGeometry = {
                    type: 'FeatureCollection',
                    features: [
                        {
                            type: 'Feature',
                            geometry: {
                                type: 'LineString',
                                coordinates: [startLngLat, endLngLat]
                            }
                        }
                    ]
                };
                
                startAirplaneAnimation(routeGeometry, startLngLat, airplaneId);
            } else {
                const response = await fetch(
                    `https://api.mapbox.com/directions/v5/mapbox/${transportMode}/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
                );
                const data = await response.json();
                
                if (data.routes && data.routes.length > 0) {
                    routeGeometry = data.routes[0].geometry;
                } else {
                    return;
                }
            }
            
            mapRef.current.addSource(routeId, {
                type: 'geojson',
                data: routeGeometry
            });
            
            mapRef.current.addLayer({
                id: routeId,
                source: routeId,
                type: 'line',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': transportMode === 'driving' ? '#007cbf' : 
                                 transportMode === 'walking' ? '#28a745' : '#dc3545',
                    'line-width': 4,
                    'line-opacity': 0.8
                }
            });

            activeRoutesRef.current.set(routeKey, { routeId, airplaneId, transportMode });
            
        } catch (error) {
            console.error('Error fetching route:', error);
        }
    };

    const startAirplaneAnimation = (routeGeometry, startCoords, airplaneId) => {
        if (!mapRef.current || !routeGeometry) return;

        console.log('Starting airplane animation with route:', routeGeometry);
        console.log('Start coordinates:', startCoords);

        const steps = 200;
        const lineDistance = turf.length(routeGeometry.features[0]);
        const arc = [];

        for (let i = 0; i < lineDistance; i += lineDistance / steps) {
            const segment = turf.along(routeGeometry.features[0], i);
            arc.push(segment.geometry.coordinates);
        }

        routeGeometry.features[0].geometry.coordinates = arc;

        const airplanePoint = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Point',
                        coordinates: startCoords
                    }
                }
            ]
        };

        console.log('Airplane point created:', airplanePoint);

        mapRef.current.addSource(airplaneId, {
            type: 'geojson',
            data: airplanePoint
        });

        mapRef.current.addLayer({
            id: airplaneId,
            source: airplaneId,
            type: 'circle',
            paint: {
                'circle-radius': 8,
                'circle-color': '#dc3545',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff'
            }
        });

        animateAirplane(steps, airplaneId, routeGeometry);
    };

    const animateAirplane = (steps, airplaneId, routeGeometry) => {
        let counter = 0;
        let running = true;

        const animate = () => {
            if (!running || !mapRef.current) {
                return;
            }

            const coordinates = routeGeometry.features[0].geometry.coordinates;
            
            if (counter >= coordinates.length) {
                const finalPoint = {
                    type: 'FeatureCollection',
                    features: [
                        {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'Point',
                                coordinates: coordinates[coordinates.length - 1]
                            }
                        }
                    ]
                };
                mapRef.current.getSource(airplaneId).setData(finalPoint);
                running = false;
                return;
            }

            const start = coordinates[counter >= coordinates.length ? coordinates.length - 1 : counter];
            const end = coordinates[counter >= coordinates.length - 1 ? coordinates.length - 1 : counter + 1];

            if (!start || !end) {
                running = false;
                return;
            }

            const airplanePoint = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'Point',
                            coordinates: start
                        }
                    }
                ]
            };

            mapRef.current.getSource(airplaneId).setData(airplanePoint);

            counter++;
            if (running) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    };

    const clearAirplaneAnimation = () => {
        if (airplaneAnimationRef.current) {
            cancelAnimationFrame(airplaneAnimationRef.current);
            airplaneAnimationRef.current = null;
        }
        animationRunningRef.current = false;
        animationCounterRef.current = 0;

        if (mapRef.current && mapRef.current.getLayer('airplane')) {
            mapRef.current.removeLayer('airplane');
        }
        if (mapRef.current && mapRef.current.getSource('airplane')) {
            mapRef.current.removeSource('airplane');
        }
    };

    const clearRoute = () => {
        if (mapRef.current) {
            activeRoutesRef.current.forEach((routeInfo, routeKey) => {
                const { routeId, airplaneId } = routeInfo;
                
                if (mapRef.current.getLayer(routeId)) {
                    mapRef.current.removeLayer(routeId);
                }
                if (mapRef.current.getSource(routeId)) {
                    mapRef.current.removeSource(routeId);
                }
                if (mapRef.current.getLayer(airplaneId)) {
                    mapRef.current.removeLayer(airplaneId);
                }
                if (mapRef.current.getSource(airplaneId)) {
                    mapRef.current.removeSource(airplaneId);
                }
            });
            
            activeRoutesRef.current.clear();
        }
        clearAirplaneAnimation();
        routeLineRef.current = null;
        routeCounterRef.current = 0;
    };

    const getTransportModeLabel = (mode) => {
        switch (mode) {
            case 'driving': return 'Voiture';
            case 'walking': return 'Marche';
            case 'flying': return 'Avion';
            default: return 'Voiture';
        }
    };

    useEffect(() => {
        if (mapRef.current && mapInitialized) {
            stepMarkersRef.current.forEach(marker => marker.remove());
            stepMarkersRef.current = [];

            if (steps && steps.length > 0) {
                const newMarkers = steps.map((step, index) => {
                    if (!step.location) return null;
                    const [lat, lng] = step.location.split(',').map(Number);
                    if (isNaN(lat) || isNaN(lng)) return null;

                    const marker = new mapboxgl.Marker()
                        .setLngLat([lng, lat])
                        .addTo(mapRef.current);

                    marker.getElement().addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (popupRef.current) {
                            popupRef.current.remove();
                        }
                        
                        const startDate = step.start_date ? step.start_date.split('T')[0] : 'N/A';
                        const endDate = step.end_date ? step.end_date.split('T')[0] : 'N/A';
                        const hasNextStep = index < steps.length - 1 && steps[index + 1].location;

                        popupRef.current = new mapboxgl.Popup({ offset: 25 })
                            .setLngLat([lng, lat])
                            .setHTML(`
                                <div class="step-popup">
                                    <h3>${step.title}</h3>
                                    <p>${step.description}</p>
                                    <p><strong>${t('map.step.start')}:</strong> ${startDate}</p>
                                    <p><strong>${t('map.step.end')}:</strong> ${endDate}</p>
                                    ${hasNextStep ? `
                                        <div class="route-controls">
                                            <select class="transport-mode" id="transport-mode-${index}">
                                                <option value="driving">${t('map.transport.driving')}</option>
                                                <option value="walking">${t('map.transport.walking')}</option>
                                                <option value="flying">${t('map.transport.flying')}</option>
                                            </select>
                                            <button class="route-btn" id="route-btn-${index}">${t('map.step.routeToNext')}</button>
                                        </div>
                                    ` : ''}
                                </div>
                            `)
                            .addTo(mapRef.current);

                        if (hasNextStep) {
                            setTimeout(() => {
                                const routeBtn = document.getElementById(`route-btn-${index}`);
                                const transportSelect = document.getElementById(`transport-mode-${index}`);
                                
                                if (routeBtn && transportSelect) {
                                    const routeKey = `route-${index}-${index + 1}`;
                                    
                                    routeBtn.addEventListener('click', () => {
                                        const nextStep = steps[index + 1];
                                        const [nextLat, nextLng] = nextStep.location.split(',').map(Number);
                                        const selectedMode = transportSelect.value;
                                        const startCoords = [lng, lat];
                                        const endCoords = [nextLng, nextLat];
                                        console.log('Route coordinates:', { start: startCoords, end: endCoords });
                                        fetchRoute(startCoords, endCoords, selectedMode, routeKey);
                                        popupRef.current.remove();
                                    });

                                    transportSelect.addEventListener('change', () => {
                                        const nextStep = steps[index + 1];
                                        const [nextLat, nextLng] = nextStep.location.split(',').map(Number);
                                        const selectedMode = transportSelect.value;
                                        const startCoords = [lng, lat];
                                        const endCoords = [nextLng, nextLat];
                                        
                                        const activeRoute = activeRoutesRef.current.get(routeKey);
                                        if (activeRoute && activeRoute.transportMode !== selectedMode) {
                                            console.log('Updating route with new transport mode:', selectedMode);
                                            fetchRoute(startCoords, endCoords, selectedMode, routeKey);
                                        }
                                    });
                                }
                            }, 100);
                        }
                    });
                    
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
                clearAirplaneAnimation();
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

                const name = place.properties.name || t('map.poi.noName');
                const category = place.properties.category_en || t('map.poi.uncategorized');

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
                            <span class="action-label">${t('map.poi.addStop')}</span>
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