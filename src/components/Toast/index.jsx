import React from 'react';
import { useTranslation } from 'react-i18next';
import './Toast.css';

const Toast = ({ message, type = 'error', onClose }) => {
    const { t } = useTranslation();

    return (
        <div className={`toast-container ${type}`}>
            <div className="toast-content">
                <div className="toast-icon">
                    {type === 'error' && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" fill="currentColor"/>
                        </svg>
                    )}
                    {type === 'success' && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.177-7.86l-2.765-2.767L7 14.431l3.119 3.121a1 1 0 001.414 0l5.952-5.95-1.062-1.062-5.6 5.6z" fill="currentColor"/>
                        </svg>
                    )}
                </div>
                <div className="toast-message">
                    {message || t('toast.defaultError')}
                </div>
                <button className="toast-close" onClick={onClose}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Toast;