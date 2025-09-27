// RatingSystem.js - Rating criteria component with reset function
import React, { useState, forwardRef, useImperativeHandle } from 'react';

const RatingSystem = forwardRef(({ onRatingChange }, ref) => {
  const criteria = [
    { id: 'accuracy', label: 'Accuracy' },
    { id: 'completeness', label: 'Completeness' },
    { id: 'clarity', label: 'Clarity' },
    { id: 'relevance', label: 'Relevance' },
    { id: 'overall', label: 'Overall Quality' }
  ];

  const [ratings, setRatings] = useState({
    accuracy: 0,
    completeness: 0,
    clarity: 0,
    relevance: 0,
    overall: 0
  });

  // Expose the resetRatings method to parent components
  useImperativeHandle(ref, () => ({
    resetRatings: () => {
      setRatings({
        accuracy: 0,
        completeness: 0,
        clarity: 0,
        relevance: 0,
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
            <div className="criterion-label">{criterion.label}</div>
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