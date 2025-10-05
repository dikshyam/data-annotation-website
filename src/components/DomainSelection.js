// DomainSelection.js - Updated with instructions
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
      
      <div className="instructions-section">
        <h3>Instructions</h3>
        <p>Please read the instructions for each task carefully before beginning your evaluation.</p>
      </div>

      <div className="domain-grid">
        {/* Knowledge Distillation Card */}
        <div className="domain-card">
          <div className="domain-header">
            <h3>Knowledge Distillation</h3>
            <span className="task-type">Rating Task</span>
          </div>
          
          <div className="domain-instructions">
            <h4>What you'll do:</h4>
            <ul>
              <li>Review polymer science questions with detailed molecular information</li>
              <li>Evaluate <strong>3 different answers</strong> for each question</li>
              <li>Rate each answer on 4 criteria: Relevance, Coverage, Accuracy, and Overall Rating</li>
              <li>Only <strong>Overall Rating is required</strong> - others are optional</li>
              <li>Provide optional comments for each answer</li>
            </ul>
            
            <h4>Layout:</h4>
            <ul>
              <li><strong>Left side:</strong> Question text and polymer details (reference)</li>
              <li><strong>Right side:</strong> Three answers to rate individually</li>
            </ul>
            
            <h4>Rating scale:</h4>
            <p>1 = Poor, 2 = Fair, 3 = Good, 4 = Very Good, 5 = Excellent</p>
          </div>
          
          <button 
            className="domain-button knowledge-distillation"
            onClick={() => handleDomainClick('Knowledge Distillation')}
          >
            Start Knowledge Distillation
          </button>
        </div>

        {/* Response Preference Card */}
        <div className="domain-card">
          <div className="domain-header">
            <h3>Response Preference</h3>
            <span className="task-type">Comparison Task</span>
          </div>
          
          <div className="domain-instructions">
          <h4>What you'll do:</h4>
          <ul>
            <li>Review a scientific question along with relevant polymer structure and property data</li>
            <li>Compare <strong>three AI-generated responses</strong> provided for the same question</li>
            <li><strong>Select the response</strong> that demonstrates the most accurate and coherent reasoning trace</li>
            <li>Rate <strong>each response</strong> independently on key quality dimensions</li>
            <li>Provide brief comments explaining your choice and ratings</li>
          </ul>
          
          <h4>Focus areas:</h4>
          <ul>
            <li><strong>Relevance</strong> — how well the answer addresses the specific question</li>
            <li><strong>Completeness</strong> — coverage of key polymer properties, structures, and reasoning steps</li>
            <li><strong>Accuracy</strong> — correctness of chemical and factual content</li>
            <li><strong>Clarity</strong> — logical flow and interpretability of the reasoning</li>
          </ul>
          
          <h4>Your task:</h4>
          <p>Select the most scientifically sound and well-reasoned response, rate all responses on the provided scales, and include short comments to justify your evaluation.</p>
        </div>

          
          <button 
            className="domain-button response-preference"
            onClick={() => handleDomainClick('Response Preference')}
          >
            Start Response Preference
          </button>
        </div>
      </div>
      
      <div className="general-notes">
        <h4>General Notes:</h4>
        <ul>
          <li>You can switch between tasks at any time using the "Change Domain" button</li>
          <li>Your progress is automatically saved</li>
          <li>Questions you've already reviewed will not be shown again</li>
          <li>Each question needs 3 total reviews before completion</li>
        </ul>
      </div>
    </div>
  );
}

export default DomainSelection;