import { React, useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';
import "./index.css";

mapboxgl.accessToken = 'pk.eyJ1IjoiZHJlN2RqaWIiLCJhIjoiY21hdG1kMmQwMDRucDJpcjc3aHIyd2xzNiJ9.JPVjlUEWyuQL090d0FyzfQ';

const Map = () => {
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);
    const [mapInitialized, setMapInitialized] = useState(false);
    const popupRef = useRef(null);

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
                console.log('Feature cliquée:', place);

                const name = place.properties.name || 'Lieu sans nom';
                const category = place.properties.class || place.properties.type || 'Non catégorisé';
                const type = place.properties.type || 'Non spécifié';

                if (popupRef.current) {
                    popupRef.current.remove();
                }

                popupRef.current = new mapboxgl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(`
                        <div class="poi-popup">
                            <h3>${name}</h3>
                            <p>Catégorie: ${category}</p>
                            <p>Type: ${type}</p>
                        </div>
                    `)
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