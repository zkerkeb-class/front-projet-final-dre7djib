import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS, handleApiResponse } from '../../config/api';
import Toast from '../Toast';
import './index.css';

const LoginPage = () => {
    const { t } = useTranslation();

    useEffect(() => {
        const authToken = sessionStorage.getItem('authToken');
        if (authToken) {
            window.location.href = '/';
        }
    }, []);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        setShowToast(false);

        try {
            const response = await fetch(API_ENDPOINTS.LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await handleApiResponse(response);
            
            sessionStorage.setItem('authToken', data.access_token);
            
            if (formData.rememberMe) {
                localStorage.setItem('authToken', data.access_token);
            }

            window.location.href = '/';
            
        } catch (err) {
            setError(err.message || t('login.error.networkError'));
            setToastMessage(t('toast.networkError'));
            setShowToast(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>{t('login.greeting')}</h1>
                <h2>{t('login.welcome')}</h2>
                <p className="welcome-text">{t('login.welcomeMessage')}</p>

                <form onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}
                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={t('login.email.placeholder')}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder={t('login.password.placeholder')}
                            required
                        />
                    </div>

                    <div className="form-options">
                        <label className="remember-me">
                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                            />
                            <span>{t('login.rememberMe')}</span>
                        </label>
                        <Link to="/forgot-password" className="forgot-password">
                            {t('login.forgotPassword')}
                        </Link>
                    </div>

                    <button 
                        type="submit" 
                        className="sign-in-button"
                        disabled={isLoading}
                    >
                        {isLoading ? t('login.signingIn') : t('login.signIn')}
                    </button>

                    <div className="signup-prompt">
                        {t('login.noAccount')} <Link to="/signup">{t('login.signUp')}</Link>
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

export default LoginPage;