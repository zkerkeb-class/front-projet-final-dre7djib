import React, { useState, useEffect } from 'react';
import './index.css';

const AddStopPopup = ({ isOpen, onClose, poi, onAddStop }) => {
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
                <h2>Add a Stop</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Type</label>
                        <select name="type" value={formData.type} onChange={handleChange}>
                            <option value="activity">Activity</option>
                            <option value="lodging">Lodging</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Title</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
                    </div>
                    <div className="form-group">
                        <label>Place</label>
                        <input type="text" name="place" value={formData.place} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Start Date</label>
                        <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>End Date</label>
                        <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} />
                    </div>
                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
                        <button type="submit" className="submit-btn">Add Stop</button>
                    </div>
                </form>
                <button onClick={onClose} className="close-popup-btn">&times;</button>
            </div>
        </div>
    );
};

export default AddStopPopup; 