import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { API_ENDPOINTS } from '../../config/api';
import { decodeJWT, isTokenExpired, clearExpiredToken } from '../../utils/jwt';
import './index.css';

const RoutePreferences = ({ isVisible, onToggle, onPreferencesChange, initialPreferences }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [preferences, setPreferences] = useState({
        showRoutes: false,
        defaultTransportMode: 'driving',
        autoShowRoutes: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (initialPreferences) {
            const mergedPreferences = {
                showRoutes: initialPreferences.showRoutes || false,
                defaultTransportMode: initialPreferences.defaultTransportMode || 'driving',
                autoShowRoutes: initialPreferences.autoShowRoutes || false
            };
            setPreferences(mergedPreferences);
        }
    }, [initialPreferences]);

    const savePreferences = async (newPreferences) => {
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
        if (!decodedToken?.sub) {
            navigate('/login');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.USER_PREFERENCES, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: decodedToken.sub,
                    routePreferences: newPreferences
                })
            });

            if (response.status === 401) {
                clearExpiredToken();
                navigate('/login');
                return;
            }

            if (response.ok) {
                setPreferences(newPreferences);
            } else {
                console.error('Failed to save preferences to API');
                setError(t('preferences.saveError'));
            }
        } catch (error) {
            console.error('Error saving preferences:', error);
            setError(t('preferences.saveError'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleShowRoutes = () => {
        const newPreferences = { ...preferences, showRoutes: !preferences.showRoutes };
        savePreferences(newPreferences);
        onToggle && onToggle(newPreferences.showRoutes);
        onPreferencesChange && onPreferencesChange(newPreferences);
    };

    const handleTransportModeChange = (mode) => {
        const newPreferences = { ...preferences, defaultTransportMode: mode };
        savePreferences(newPreferences);
        onPreferencesChange && onPreferencesChange(newPreferences);
    };

    const handleAutoShowRoutesChange = () => {
        const newPreferences = { ...preferences, autoShowRoutes: !preferences.autoShowRoutes };
        savePreferences(newPreferences);
        onPreferencesChange && onPreferencesChange(newPreferences);
    };

    if (!isVisible) return null;

    if (!initialPreferences) {
        return (
            <div className="route-preferences">
                <h3>{t('preferences.title')}</h3>
                <div className="preferences-loading">
                    {t('preferences.loading')}
                </div>
            </div>
        );
    }

    return (
        <div className="route-preferences">
            <h3>{t('preferences.title') || 'Préférences de trajets'}</h3>
            
            <div className="preference-item">
                <label className="preference-label">
                    <input
                        type="checkbox"
                        checked={preferences.showRoutes}
                        onChange={handleToggleShowRoutes}
                        disabled={isLoading}
                    />
                    <span>{t('preferences.showRoutes')}</span>
                </label>
            </div>

            <div className="preference-item">
                <label className="preference-label">
                    <span>{t('preferences.defaultTransport')}</span>
                    <select
                        value={preferences.defaultTransportMode}
                        onChange={(e) => handleTransportModeChange(e.target.value)}
                        disabled={isLoading}
                    >
                        <option value="driving">{t('map.transport.driving')}</option>
                        <option value="walking">{t('map.transport.walking')}</option>
                        <option value="flying">{t('map.transport.flying')}</option>
                    </select>
                </label>
            </div>

            <div className="preference-item">
                <label className="preference-label">
                    <input
                        type="checkbox"
                        checked={preferences.autoShowRoutes}
                        onChange={handleAutoShowRoutesChange}
                        disabled={isLoading}
                    />
                    <span>{t('preferences.autoShowRoutes')}</span>
                </label>
            </div>

            {isLoading && (
                <div className="preferences-loading">
                    {t('preferences.saving')}
                </div>
            )}
            
            {error && (
                <div className="preferences-error">
                    {error}
                </div>
            )}
        </div>
    );
};

export default RoutePreferences; 