// ThankYou.js - Final page shown after reviewing
import React from 'react';
import { Link } from 'react-router-dom';

function ThankYou() {
  // Extract and display stats from localStorage
  const getResponseStats = () => {
    const savedResponses = localStorage.getItem('annotationResponses');
    if (!savedResponses) {
      return { count: 0, domains: {} };
    }

    const responses = JSON.parse(savedResponses);
    const domains = {};
    
    // Count responses by domain
    responses.forEach(response => {
      if (!domains[response.domain]) {
        domains[response.domain] = 0;
      }
      domains[response.domain]++;
    });

    return {
      count: responses.length,
      domains
    };
  };

  const stats = getResponseStats();

  return (
    <div className="thank-you">
      <h2>Thank You for Your Contributions!</h2>
      <p>Your ratings help improve our understanding of scientific answers.</p>
      
      <div className="stats-container">
        <h3>Your Contribution Summary:</h3>
        <p>Total answers reviewed: {stats.count}</p>
        
        <h4>By Domain:</h4>
        <ul>
          {Object.entries(stats.domains).map(([domain, count]) => (
            <li key={domain}>
              {domain}: {count} answer{count !== 1 ? 's' : ''}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="action-buttons">
        <Link to="/" className="restart-button">
          Review More Questions
        </Link>
      </div>
    </div>
  );
}

export default ThankYou;