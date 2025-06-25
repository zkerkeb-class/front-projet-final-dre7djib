import React from 'react';
import './index.css';

const ContactPage = () => {
  return (
    <div className="contact-page">
      <div className="contact-card">
        <h1>Contact</h1>
        <div className="contact-info">
          <div className="contact-row">
            <span className="contact-label">Nom :</span>
            <span className="contact-value">Djibril Camara</span>
          </div>
          <div className="contact-row">
            <span className="contact-label">Email :</span>
            <a className="contact-value" href="mailto:djibril.camara@ynov.com">djibril.camara@ynov.com</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage; 