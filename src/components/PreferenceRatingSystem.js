// PreferenceRatingSystem.js - Simplified rating system for preference evaluation
import React, { useState, forwardRef, useImperativeHandle } from 'react';

const PreferenceRatingSystem = forwardRef(({ onRatingChange, isPreferred }, ref) => {
  const criteria = [
    { id: 'overall', label: 'Overall Quality', required: true },
    { id: 'accuracy', label: 'Accuracy', required: false },
    { id: 'helpfulness', label: 'Helpfulness', required: false },
    { id: 'clarity', label: 'Clarity', required: false },
    { id: 'completeness', label: 'Completeness', required: false }
  ];
  
  const [ratings, setRatings] = useState({
    overall: 0,
    accuracy: 0,
    helpfulness: 0,
    clarity: 0,
    completeness: 0
  });

  // Expose the resetRatings method to parent components
  useImperativeHandle(ref, () => ({
    resetRatings: () => {
      setRatings({
        overall: 0,
        accuracy: 0,
        helpfulness: 0,
        clarity: 0
      });
    }
  }));

  const handleRatingClick = (criterionId, value) => {
    const newRatings = { ...ratings, [criterionId]: value };
    setRatings(newRatings);
    onRatingChange(newRatings);
  };

  return (
    <div className={`preference-rating-system ${isPreferred ? 'preferred-answer' : ''}`}>
      {isPreferred && (
        <div className="preferred-badge">⭐ Your Preferred Choice</div>
      )}
      
      {criteria.map(criterion => (
        <div key={criterion.id} className="rating-criterion">
          <div className="criterion-label">
            {criterion.label}
            {criterion.required && <span className="required"> *</span>}
          </div>
          <div className="rating-buttons">
            {[1, 2, 3, 4, 5, 6, 7].map(value => (
              <button
                key={value}
                className={`rating-button ${ratings[criterion.id] === value ? 'selected' : ''}`}
                onClick={() => handleRatingClick(criterion.id, value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

export default PreferenceRatingSystem;