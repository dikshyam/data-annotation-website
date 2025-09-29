// EmailInput.js
import React, { useState } from 'react';

function EmailInput({ onEmailSubmit }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    onEmailSubmit(email.trim().toLowerCase());
  };

  return (
    <div className="email-input-container">
      <div className="email-input-card">
        <h2>Data Annotation Project</h2>
        <p>Please enter your email address to begin the review process.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email Address:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="your.email@example.com"
              className={error ? 'error' : ''}
            />
            {error && <span className="error-message">{error}</span>}
          </div>
          
          <button type="submit" className="submit-button">
            Start Review
          </button>
        </form>
      </div>
    </div>
  );
}

export default EmailInput;