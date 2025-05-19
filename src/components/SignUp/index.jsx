import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS, handleApiResponse } from '../../config/api';
import Toast from '../Toast';
import './index.css';

const SignUp = () => {
    const { t } = useTranslation();

    useEffect(() => {
        const authToken = sessionStorage.getItem('authToken');
        if (authToken) {
            window.location.href = '/';
        }
    }, []);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        setShowToast(false);

        if (formData.password !== formData.confirmPassword) {
            setError(t('signup.error.passwordMismatch'));
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(API_ENDPOINTS.SIGNUP, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            await handleApiResponse(response);
            window.location.href = '/login';
            
        } catch (err) {
            setError(err.message || t('signup.error.networkError'));
            setToastMessage(err.message || t('toast.networkError'));
            setShowToast(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>{t('signup.title')}</h1>
                <h2>{t('signup.subtitle')}</h2>
                <p className="welcome-text">{t('signup.welcomeMessage')}</p>

                <form onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}
                    
                    <div className="form-group">
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder={t('signup.name.placeholder')}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={t('signup.email.placeholder')}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder={t('signup.password.placeholder')}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder={t('signup.confirmPassword.placeholder')}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="sign-in-button"
                        disabled={isLoading}
                    >
                        {isLoading ? t('signup.loading') : t('signup.submit')}
                    </button>

                    <div className="signup-prompt">
                        {t('signup.haveAccount')} <Link to="/login">{t('signup.signIn')}</Link>
                    </div>
                </form>
            </div>
            {showToast && (
                <Toast 
                    message={toastMessage}
                    type="error"
                    onClose={() => setShowToast(false)}
                />
            )}
        </div>
    );
};

export default SignUp;