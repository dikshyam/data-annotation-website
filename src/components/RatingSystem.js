// RatingSystem.js - Rating criteria component with reset function
import React, { useState, forwardRef, useImperativeHandle } from 'react';

const RatingSystem = forwardRef(({ onRatingChange }, ref) => {
  const criteria = [
    { id: 'reasoning', label: 'Reasoning' },
    { id: 'accuracy', label: 'Accuracy' },
    { id: 'domainKnowledge', label: 'Domain Knowledge' },
    { id: 'creativity', label: 'Creativity' },
    { id: 'difficulty', label: 'Level of Difficulty' }
  ];

  const [ratings, setRatings] = useState({
    reasoning: 0,
    accuracy: 0,
    domainKnowledge: 0,
    creativity: 0,
    difficulty: 0
  });

  // Expose the resetRatings method to parent components
  useImperativeHandle(ref, () => ({
    resetRatings: () => {
      setRatings({
        reasoning: 0,
        accuracy: 0,
        domainKnowledge: 0,
        creativity: 0,
        difficulty: 0
      });
    }
  }));

  const handleRatingClick = (criterionId, value) => {
    const newRatings = { ...ratings, [criterionId]: value };
    setRatings(newRatings);
    onRatingChange(newRatings);
  };

  return (
    <div className="rating-system">
      {criteria.map(criterion => (
        <div key={criterion.id} className="rating-criterion">
          <div className="criterion-label">{criterion.label}</div>
          <div className="rating-buttons">
            {[1, 2, 3, 4, 5].map(value => (
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

export default RatingSystem;