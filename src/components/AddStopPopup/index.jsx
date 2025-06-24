import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './index.css';

const AddStopPopup = ({ isOpen, onClose, poi, onAddStop }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        type: 'activity',
        title: '',
        description: '',
        place: '',
        start_date: '',
        end_date: ''
    });

    useEffect(() => {
        if (poi) {
            setFormData(prev => ({
                ...prev,
                title: poi.properties.name || '',
                place: poi.place_name ? poi.place_name.split(',').slice(0, 2).join(',') : (poi.properties.name || ''),
                description: '',
                start_date: '',
                end_date: ''
            }));
        }
    }, [poi]);

    if (!isOpen) {
        return null;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddStop(formData);
        onClose();
    };

    return (
        <div className="add-stop-popup-overlay">
            <div className="add-stop-popup-content">
                <h2>{t('addStop.title')}</h2>
                <form onSubmit={handleSubmit} className='add-stop-popup-form'>
                    <div className="form-group">
                        <label>{t('addStop.form.type')}</label>
                        <select name="type" value={formData.type} onChange={handleChange}>
                            <option value="activity">{t('addStop.types.activity')}</option>
                            <option value="lodging">{t('addStop.types.lodging')}</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>{t('addStop.form.title')}</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>{t('addStop.form.description')}</label>
                        <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
                    </div>
                    <div className="form-group">
                        <label>{t('addStop.form.place')}</label>
                        <input type="text" name="place" value={formData.place} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>{t('addStop.form.startDate')}</label>
                        <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>{t('addStop.form.endDate')}</label>
                        <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} />
                    </div>
                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="cancel-btn">{t('addStop.form.cancel')}</button>
                        <button type="submit" className="submit-btn">{t('addStop.form.addStop')}</button>
                    </div>
                </form>
                <button onClick={onClose} className="close-popup-btn">&times;</button>
            </div>
        </div>
    );
};

export default AddStopPopup; 