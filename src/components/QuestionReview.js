// QuestionReview.js - Updated with prioritized question selection
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import RatingSystem from './RatingSystem';
import submitToGoogleSheets from '../utils/GoogleSheetsSubmit';

function QuestionReview({ domain, onSubmitResponse }) {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [ratings, setRatings] = useState({});
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewedPairs, setReviewedPairs] = useState({});
  const [feedbackRecorded, setFeedbackRecorded] = useState(false);
  // Create a ref to the RatingSystem component
  const ratingSystemRef = useRef();

  // Load questions based on selected domain
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const normalizedDomain = domain.toLowerCase().replace(' ', '-');
        const response = await fetch(`${process.env.PUBLIC_URL}/data/${normalizedDomain}-questions.json`);
        if (!response.ok) {
          throw new Error('Failed to load questions');
        }
        const data = await response.json();
        setQuestions(data.questions);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading questions:', error);
        setIsLoading(false);
      }
    };

    loadQuestions();
    
    // Load reviewed pairs from localStorage
    const savedReviewedPairs = localStorage.getItem('reviewedPairs');
    if (savedReviewedPairs) {
      setReviewedPairs(JSON.parse(savedReviewedPairs));
    }
  }, [domain]);

  // Select a question and answer when questions are loaded
  useEffect(() => {
    if (questions.length > 0 && !currentQuestion) {
      selectPrioritizedQuestionAnswer();
    }
  }, [questions, reviewedPairs]);

  // Typeset math when question or answer changes
  useEffect(() => {
    if (currentQuestion && selectedAnswer && window.MathJax) {
      // Use a small timeout to ensure the content is in the DOM
      setTimeout(() => {
        window.MathJax.typeset();
      }, 100);
    }
  }, [currentQuestion, selectedAnswer]);

  // Save reviewed pairs to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('reviewedPairs', JSON.stringify(reviewedPairs));
  }, [reviewedPairs]);

  // Get a pair ID from question and answer IDs
  const getPairId = (questionId, answerId) => `${questionId}-${answerId}`;

  // Get review count for a specific question-answer pair
  const getPairReviewCount = (questionId, answerId) => {
    const pairId = getPairId(questionId, answerId);
    return reviewedPairs[pairId] || 0;
  };

  // Select a question-answer pair with prioritization
  const selectPrioritizedQuestionAnswer = () => {
    // First, create all possible question-answer pairs
    const allPairs = [];
    
    questions.forEach(question => {
      question.answers.forEach(answer => {
        allPairs.push({
          question,
          answer,
          reviewCount: getPairReviewCount(question.id, answer.id)
        });
      });
    });
    
    if (allPairs.length === 0) {
      console.error('No question-answer pairs available');
      return;
    }
    
    // Find the minimum review count among all pairs
    const minReviewCount = Math.min(...allPairs.map(pair => pair.reviewCount));
    
    // Filter to get only the pairs with the minimum review count
    const priorityPairs = allPairs.filter(pair => pair.reviewCount === minReviewCount);
    
    // Randomly select one of the priority pairs
    const randomIndex = Math.floor(Math.random() * priorityPairs.length);
    const selectedPair = priorityPairs[randomIndex];
    
    // Set the selected question and answer
    setCurrentQuestion(selectedPair.question);
    setSelectedAnswer(selectedPair.answer);
    setRatings({});
    setComment('');
    setFeedbackRecorded(false);
    
    // Reset the rating UI by calling reset method on the RatingSystem component
    if (ratingSystemRef.current) {
      ratingSystemRef.current.resetRatings();
    }
    
    console.log(`Selected pair: ${selectedPair.question.id}-${selectedPair.answer.id} (Review count: ${selectedPair.reviewCount})`);
  };

  const handleRatingChange = (newRatings) => {
    setRatings(newRatings);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleRecordFeedback = () => {
    // Check if all criteria have been rated
    const allRated = Object.values(ratings).every(rating => rating > 0);
    
    if (!allRated) {
      alert('Please rate all criteria before submitting.');
      return;
    }

    setIsSubmitting(true);

    // Create response object
    const response = {
      timestamp: new Date().toISOString(),
      domain,
      questionId: currentQuestion.id,
      questionText: currentQuestion.text,
      answerId: selectedAnswer.id,
      answerText: selectedAnswer.text,
      ratings,
      comment
    };

    // Submit to Google Sheets
    submitToGoogleSheets(response);

    // Submit the response to local storage
    onSubmitResponse(response);
    
    // Update the review count for this pair
    const pairId = getPairId(currentQuestion.id, selectedAnswer.id);
    const currentCount = reviewedPairs[pairId] || 0;
    
    setReviewedPairs(prev => ({
      ...prev,
      [pairId]: currentCount + 1
    }));
    
    // Mark feedback as recorded
    setFeedbackRecorded(true);
    setIsSubmitting(false);
  };

  const handleNextQuestion = () => {
    // Only allow going to the next question if feedback has been recorded
    if (!feedbackRecorded) {
      alert('Please record your feedback first.');
      return;
    }
    
    // Select next prioritized question
    selectPrioritizedQuestionAnswer();
  };

  if (isLoading) {
    return <div className="loading">Loading questions...</div>;
  }

  if (!currentQuestion) {
    return <div className="error">No questions available</div>;
  }

  return (
    <div className="question-review">
      <h2>Review Question</h2>
      
      <div className="question-container">
        <h3>Question:</h3>
        <div 
          className="question-text"
          dangerouslySetInnerHTML={{ __html: currentQuestion.text }}
        />
      </div>
      
      <div className="answer-container">
        <h3>Answer:</h3>
        <div
          className="answer-text"
          dangerouslySetInnerHTML={{ __html: selectedAnswer.text }}
        />
      </div>
      
      <h3>Rate this answer:</h3>
      <RatingSystem onRatingChange={handleRatingChange} ref={ratingSystemRef} />
      
      <div className="comment-container">
        <h3>Additional Comments (Optional):</h3>
        <textarea 
          className="comment-textarea"
          value={comment}
          onChange={handleCommentChange}
          placeholder="Add any additional feedback or comments about this answer..."
          rows={12}
        />
      </div>
      
      <div className="action-buttons">
        <button 
          className="record-button"
          onClick={handleRecordFeedback}
          disabled={isSubmitting || feedbackRecorded}
        >
          {isSubmitting ? 'Submitting...' : feedbackRecorded ? 'Feedback Recorded ✓' : 'Record Feedback'}
        </button>
        
        <button 
          className="next-button"
          onClick={handleNextQuestion}
          disabled={!feedbackRecorded}
        >
          Review Another Question
        </button>
      </div>
    </div>
  );
}

export default QuestionReview;