import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DomainSelection from './components/DomainSelection';
import QuestionReview from './components/QuestionReview';
import ThankYou from './components/ThankYou';
import './styles/main.css';

function App() {
  const [selectedDomain, setSelectedDomain] = useState('');
  const [responses, setResponses] = useState([]);
  
  // Load any previous responses from localStorage
  useEffect(() => {
    const savedResponses = localStorage.getItem('annotationResponses');
    if (savedResponses) {
      setResponses(JSON.parse(savedResponses));
    }
  }, []);

  // Save responses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('annotationResponses', JSON.stringify(responses));
  }, [responses]);

  const handleDomainSelect = (domain) => {
    setSelectedDomain(domain);
  };

  const handleSubmitResponse = (response) => {
    setResponses([...responses, response]);
  };

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div className="app-container">
        <header className="app-header">
          <h1>Scientific Answer Rating System</h1>
        </header>
        <main className="app-content">
          <Routes>
            <Route 
              path="/" 
              element={<DomainSelection onDomainSelect={handleDomainSelect} />} 
            />
            <Route 
              path="/questions/:domain" 
              element={
                selectedDomain ? 
                <QuestionReview 
                  domain={selectedDomain} 
                  onSubmitResponse={handleSubmitResponse}
                /> : 
                <Navigate to="/" />
              } 
            />
            <Route path="/thank-you" element={<ThankYou />} />
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