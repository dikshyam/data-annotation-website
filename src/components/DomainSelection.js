import React from 'react';
import { useNavigate } from 'react-router-dom';

function DomainSelection({ onDomainSelect }) {
  const navigate = useNavigate();

  const handleDomainClick = (domain) => {
    onDomainSelect(domain);
    navigate(`/questions/${domain.toLowerCase().replace(' ', '-')}`);
  };

  return (
    <div className="domain-selection">
      <h2>Select Your Domain</h2>
      <div className="domain-buttons">
        <button 
          className="domain-button material-science"
          onClick={() => handleDomainClick('Material Science')}
        >
          Material Science
        </button>
        <button 
          className="domain-button chemistry"
          onClick={() => handleDomainClick('Chemistry')}
        >
          Chemistry
        </button>
      </div>
    </div>
  );
}

export default DomainSelection;