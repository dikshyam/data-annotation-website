// RatingSystem.js - Updated with Relevance, Coverage, Accuracy, Overall Rating
import React, { useState, forwardRef, useImperativeHandle } from 'react';

const RatingSystem = forwardRef(({ onRatingChange }, ref) => {
  const criteria = [
    { id: 'relevance', label: 'Relevance', required: false },
    { id: 'coverage', label: 'Coverage', required: false },
    { id: 'accuracy', label: 'Accuracy', required: false },
    { id: 'overall', label: 'Overall Rating', required: true }
  ];

  const [ratings, setRatings] = useState({
    relevance: 0,
    coverage: 0,
    accuracy: 0,
    overall: 0
  });

  useImperativeHandle(ref, () => ({
    resetRatings: () => {
      setRatings({
        relevance: 0,
        coverage: 0,
        accuracy: 0,
        overall: 0
      });
    }
  }));

  const handleRatingClick = (criterionId, value) => {
    const newRatings = { ...ratings, [criterionId]: value };
    setRatings(newRatings);
    onRatingChange(newRatings);
  };

  const getRatingLabel = (value) => {
    const labels = {
      1: 'Poor',
      2: 'Fair', 
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return labels[value] || '';
  };

  return (
    <div className="rating-system">
      {criteria.map(criterion => (
        <div key={criterion.id} className="rating-criterion">
          <div className="criterion-header">
            <div className="criterion-label">
              {criterion.label}
              {criterion.required && <span className="required-asterisk"> *</span>}
            </div>
            {ratings[criterion.id] > 0 && (
              <div className="rating-label">
                {getRatingLabel(ratings[criterion.id])} ({ratings[criterion.id]}/5)
              </div>
            )}
          </div>
          <div className="rating-buttons">
            {[1, 2, 3, 4, 5].map(value => (
              <button
                key={value}
                className={`rating-button ${ratings[criterion.id] === value ? 'selected' : ''}`}
                onClick={() => handleRatingClick(criterion.id, value)}
                title={getRatingLabel(value)}
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

export default RatingSystem;