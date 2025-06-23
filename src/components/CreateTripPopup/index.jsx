import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../../config/api';
import { decodeJWT } from '../../utils/jwt';
import './index.css';

const CreateTripPopup = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: ''
    });
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) {
            newErrors.title = t('createTrip.form.titleRequired');
        }
        if (!formData.description.trim()) {
            newErrors.description = t('createTrip.form.descriptionRequired');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        const token = sessionStorage.getItem('authToken');
        
        if (!token) {
            navigate('/login');
            return;
        }

        const decodedToken = decodeJWT(token);
        if (!decodedToken || !decodedToken.sub) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(API_ENDPOINTS.TRAVEL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    user_id: decodedToken.sub
                }),
            });

            if (response.status === 401) {
                sessionStorage.removeItem('authToken');
                navigate('/login');
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || t('createTrip.errors.creationError'));
            }

            const data = await response.json();
            onClose();
            setFormData({
                title: '',
                description: '',
                startDate: '',
                endDate: ''
            });
            navigate(`/map/${data.id}`);
            window.location.reload();
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="popup-overlay">
                <div className="popup-content">
                    <div className="popup-header">
                        <h2>{t('createTrip.title')}</h2>
                        <button 
                            className="close-button" 
                            onClick={onClose}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="create-trip-form">
                        <div className="form-group">
                            <label htmlFor="title">{t('createTrip.form.title')} *</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className={errors.title ? 'error' : ''}
                            />
                            {errors.title && <span className="error-message">{errors.title}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">{t('createTrip.form.description')} *</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className={errors.description ? 'error' : ''}
                            />
                            {errors.description && <span className="error-message">{errors.description}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="startDate">{t('createTrip.form.startDate')}</label>
                            <input
                                type="date"
                                id="startDate"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="endDate">{t('createTrip.form.endDate')}</label>
                            <input
                                type="date"
                                id="endDate"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="button" onClick={onClose}>
                                {t('createTrip.form.cancel')}
                            </button>
                            <button type="submit" className="primary">
                                {t('createTrip.form.create')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CreateTripPopup; 