// QuestionReview.js - Question and answer review component with separate buttons
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RatingSystem from './RatingSystem';

function QuestionReview({ domain, onSubmitResponse }) {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [ratings, setRatings] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewedQuestions, setReviewedQuestions] = useState([]);
  const [feedbackRecorded, setFeedbackRecorded] = useState(false);

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
  }, [domain]);

  // Select a random question and answer when questions are loaded
  useEffect(() => {
    if (questions.length > 0 && !currentQuestion) {
      selectRandomQuestionAndAnswer();
    }
  }, [questions]);

  const selectRandomQuestionAndAnswer = () => {
    // Filter out questions that have already been reviewed
    const availableQuestions = questions.filter(
      q => !reviewedQuestions.includes(q.id)
    );

    if (availableQuestions.length === 0) {
      // All questions have been reviewed
      navigate('/thank-you');
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];
    
    // Select a random answer for this question
    const answerIndex = Math.floor(Math.random() * selectedQuestion.answers.length);
    setCurrentQuestion(selectedQuestion);
    setSelectedAnswer(selectedQuestion.answers[answerIndex]);
    setRatings({});
    setFeedbackRecorded(false);
  };

  const handleRatingChange = (newRatings) => {
    setRatings(newRatings);
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
      ratings
    };

    // Submit the response
    onSubmitResponse(response);
    
    // Add the question to the reviewed list
    setReviewedQuestions([...reviewedQuestions, currentQuestion.id]);
    
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
    
    // Reset for next question
    selectRandomQuestionAndAnswer();
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
        <p>{currentQuestion.text}</p>
      </div>
      
      <div className="answer-container">
        <h3>Answer:</h3>
        <p>{selectedAnswer.text}</p>
      </div>
      
      <h3>Rate this answer:</h3>
      <RatingSystem onRatingChange={handleRatingChange} />
      
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