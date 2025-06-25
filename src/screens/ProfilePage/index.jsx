import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { API_ENDPOINTS, handleApiResponse } from '../../config/api';
import { decodeJWT } from '../../utils/jwt';
import Toast from '../../components/Toast';
import './index.css';

function ProfilePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
    setIsAuthenticated(true);
    loadUserTrips();
  };

  const loadUserTrips = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('authToken');
      
      const decodedToken = decodeJWT(token);
      
      const response = await fetch(API_ENDPOINTS.GET_USER_TRAVELS(decodedToken.sub), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const trips = await response.json();
        setUserTrips(trips);
      } else {
        throw new Error('Failed to load trips');
      }
    } catch (error) {
      console.error('Error loading trips:', error);
      displayToast(t('profile.errors.tripsLoadError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordForm.currentPassword.trim()) {
      errors.currentPassword = t('profile.errors.currentPasswordRequired');
    }
    
    if (!passwordForm.newPassword.trim()) {
      errors.newPassword = t('profile.errors.newPasswordRequired');
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = t('profile.errors.passwordMismatch');
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    try {
      setUpdatingPassword(true);
      const token = sessionStorage.getItem('authToken');
      const response = await fetch(API_ENDPOINTS.CHANGE_PASSWORD, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      
      if (response.ok) {
        displayToast(t('profile.success.passwordUpdated'), 'success');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordForm(false);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Password update failed');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      displayToast(t('profile.errors.passwordUpdateError'), 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language);
  };

  const handleTripClick = (tripId) => {
    navigate(`/map/${tripId}`);
  };

  const handleDeleteTrip = async (tripId, e) => {
    e.stopPropagation();
    
    if (!window.confirm(t('profile.tripsSection.deleteConfirmation'))) {
      return;
    }
    
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await fetch(`${API_ENDPOINTS.TRAVEL}/${tripId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setUserTrips(prev => prev.filter(trip => trip.id !== tripId));
        displayToast(t('toast.success'), 'success');
      } else {
        throw new Error('Failed to delete trip');
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
      displayToast(t('profile.errors.tripDeleteError'), 'error');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    navigate('/');
  };

  const displayToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <header className="profile-header">
          <h1>{t('profile.title')}</h1>
        </header>

        <div className="profile-content">
          {/* Language Section */}
          <section className="profile-section">
            <h2>{t('profile.language')}</h2>
            <div className="language-selector">
              <button
                className={`language-btn ${i18n.language === 'fr' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('fr')}
              >
                🇫🇷 {t('profile.languageForm.french')}
              </button>
              <button
                className={`language-btn ${i18n.language === 'en' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('en')}
              >
                🇺🇸 {t('profile.languageForm.english')}
              </button>
            </div>
          </section>

          {/* Password Change Section */}
          <section className="profile-section">
            <div className="section-header">
              <h2>{t('profile.changePassword')}</h2>
              <button
                className="toggle-btn"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                {showPasswordForm ? '−' : '+'}
              </button>
            </div>
            
            {showPasswordForm && (
              <form className="password-form" onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label>{t('profile.passwordForm.currentPassword')}</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className={passwordErrors.currentPassword ? 'error' : ''}
                  />
                  {passwordErrors.currentPassword && (
                    <span className="error-message">{passwordErrors.currentPassword}</span>
                  )}
                </div>
                
                <div className="form-group">
                  <label>{t('profile.passwordForm.newPassword')}</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className={passwordErrors.newPassword ? 'error' : ''}
                  />
                  {passwordErrors.newPassword && (
                    <span className="error-message">{passwordErrors.newPassword}</span>
                  )}
                </div>
                
                <div className="form-group">
                  <label>{t('profile.passwordForm.confirmPassword')}</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className={passwordErrors.confirmPassword ? 'error' : ''}
                  />
                  {passwordErrors.confirmPassword && (
                    <span className="error-message">{passwordErrors.confirmPassword}</span>
                  )}
                </div>
                
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    disabled={updatingPassword}
                  >
                    {t('profile.passwordForm.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="primary"
                    disabled={updatingPassword}
                  >
                    {updatingPassword ? t('profile.passwordForm.updating') : t('profile.passwordForm.update')}
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Trips Section */}
          <section className="profile-section">
            <h2>{t('profile.myTrips')}</h2>
            
            {loading ? (
              <div className="loading">{t('profile.tripsSection.loading')}</div>
            ) : userTrips.length === 0 ? (
              <div className="no-trips">{t('profile.tripsSection.noTrips')}</div>
            ) : (
              <div className="trips-grid">
                {userTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="trip-card"
                    onClick={() => handleTripClick(trip.id)}
                  >
                    <div className="trip-info">
                      <h3>{trip.title}</h3>
                      <p>{trip.description}</p>
                      <div className="trip-dates">
                        {trip.createdAt && (
                          <span>📅 {t('profile.tripsSection.createdOn')} {new Date(trip.createdAt).toLocaleDateString()}</span>
                        )}
                        {trip.updatedAt && (
                          <span>📅 {t('profile.tripsSection.modifiedOn')} {new Date(trip.updatedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="trip-actions">
                      <button
                        className="delete-btn"
                        onClick={(e) => handleDeleteTrip(trip.id, e)}
                        title={t('profile.tripsSection.deleteTrip')}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Logout Section */}
          <section className="profile-section">
            <button className="logout-btn" onClick={handleLogout}>
              {t('profile.logout')}
            </button>
          </section>
        </div>
      </div>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}

export default ProfilePage; 