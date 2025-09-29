import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import EmailInput from './components/EmailInput'; // Add this import
import DomainSelection from './components/DomainSelection';
import QuestionReview from './components/QuestionReview';
import ResponsePreferenceReview from './components/ResponsePreferenceReview';
import ThankYou from './components/ThankYou';
import './styles/main.css';

console.log('🔥 App.js file loaded');

function App() {
  console.log('🚀 App component rendering');
  
  const [selectedDomain, setSelectedDomain] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [responses, setResponses] = useState([]);
  
  // Load saved email on app start
  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setUserEmail(savedEmail);
    }
    
    const savedResponses = localStorage.getItem('annotationResponses');
    if (savedResponses) {
      setResponses(JSON.parse(savedResponses));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('annotationResponses', JSON.stringify(responses));
  }, [responses]);

  const handleEmailSubmit = (email) => {
    console.log('📧 Email submitted:', email);
    setUserEmail(email);
    localStorage.setItem('userEmail', email);
  };

  const handleDomainSelect = (domain) => {
    console.log('🎯 Domain selected:', domain);
    setSelectedDomain(domain);
  };

  const handleSubmitResponse = (response) => {
    console.log('📤 Response submitted:', response);
    setResponses([...responses, response]);
  };

  const QuestionRouteWrapper = () => {
    console.log('🛣️ QuestionRouteWrapper called');
    const { domain } = useParams();
    console.log('🛣️ URL domain param:', domain);
    
    const getDomainName = (urlDomain) => {
      const mapping = {
        'response-preference': 'Response Preference',
        'knowledge-distillation': 'Knowledge Distillation'
      };
      return mapping[urlDomain] || urlDomain;
    };

    const domainName = getDomainName(domain);
    console.log('📝 Resolved domain name:', domainName);
    
    useEffect(() => {
      if (domainName && domainName !== selectedDomain) {
        console.log('🔄 Setting domain from URL:', domainName);
        setSelectedDomain(domainName);
      }
    }, [domainName]);

    switch (domainName) {
      case 'Response Preference':
        console.log('🎯 Rendering ResponsePreferenceReview');
        return (
          <ResponsePreferenceReview 
            domain={domainName}
            userEmail={userEmail} // Pass email to component
            onSubmitResponse={handleSubmitResponse}
          />
        );
      case 'Knowledge Distillation':
        console.log('🎯 Rendering QuestionReview');
        return (
          <QuestionReview 
            domain={domainName}
            userEmail={userEmail} // Pass email to component
            onSubmitResponse={handleSubmitResponse}
          />
        );
      default:
        console.log('❌ Unknown domain, redirecting to home');
        return <Navigate to="/" />;
    }
  };

  // Show email input first if no email
  if (!userEmail) {
    return (
      <Router basename={process.env.PUBLIC_URL}>
        <div className="app-container">
          <header className="app-header">
            <h1>Scientific Answer Rating System</h1>
          </header>
          <main className="app-content">
            <EmailInput onEmailSubmit={handleEmailSubmit} />
          </main>
          <footer className="app-footer">
            <p>Data Annotation Project &copy; {new Date().getFullYear()}</p>
          </footer>
        </div>
      </Router>
    );
  }

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div className="app-container">
        <header className="app-header">
          <h1>Scientific Answer Rating System</h1>
          <div className="user-info">
            <span className="user-email">Logged in as: {userEmail}</span>
            <button 
              className="logout-btn"
              onClick={() => {
                localStorage.removeItem('userEmail');
                setUserEmail('');
                setSelectedDomain('');
                window.location.href = process.env.PUBLIC_URL || '/';
              }}
            >
              Logout
            </button>
          </div>
          {selectedDomain && (
            <div className="domain-indicator">
              <span className="current-domain">Current Domain: {selectedDomain}</span>
              <button 
                className="change-domain-btn"
                onClick={() => {
                  setSelectedDomain('');
                  window.location.href = process.env.PUBLIC_URL || '/';
                }}
              >
                Change Domain
              </button>
            </div>
          )}
        </header>
        <main className="app-content">
          <Routes>
            <Route 
              path="/" 
              element={<DomainSelection onDomainSelect={handleDomainSelect} />} 
            />
            <Route 
              path="/questions/:domain" 
              element={<QuestionRouteWrapper />}
            />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <p>Data Annotation Project &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;