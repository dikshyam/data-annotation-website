// QuestionReview.js - Fixed session tracking
import React, { useState, useEffect, useRef } from 'react';
import RatingSystem from './RatingSystem';
import submitToGoogleSheets from '../utils/GoogleSheetsSubmit';

const parsePolymerDetails = (details) => {
  if (!details) return null;
  
  const lines = details.split('\n').filter(line => line.trim());
  
  return lines.map((line, index) => (
    <div key={index} className="polymer-line">
      {line.trim()}
    </div>
  ));
};

function QuestionReview({ domain, userEmail, onSubmitResponse }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answersRatings, setAnswersRatings] = useState({});
  const [answerComments, setAnswerComments] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackRecorded, setFeedbackRecorded] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState(new Set()); // Track completed questions
  
  const ratingSystemRefs = useRef({});

  // Helper function to fetch review data from Google Sheets
  const fetchReviewData = async (domain, userEmail) => {
    try {
      const response = await fetch(`https://script.google.com/macros/s/AKfycbzKEgPf6pUzP86rsz7ZK095AScLbBwff4OqoERQD9b6B_b3Fl49VO_1yje2sGsO87NMkQ/exec?action=getAvailableQuestions&domain=${encodeURIComponent(domain)}&userEmail=${encodeURIComponent(userEmail)}`);
      const data = await response.json();
      
      if (data.error) {
        console.error('Error from server:', data.error);
        return { userReviewed: new Set(), reviewCounts: {} };
      }
      
      return {
        userReviewed: new Set(data.userReviewed || []),
        reviewCounts: data.reviewCounts || {},
        userReviewedCount: data.userReviewedCount || 0
      };
    } catch (error) {
      console.error('Error fetching review data:', error);
      return { userReviewed: new Set(), reviewCounts: {} };
    }
  };

  // Load questions from local file and filter based on Google Sheets data
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        if (domain === 'Knowledge Distillation' && userEmail) {
          const response = await fetch(`${process.env.PUBLIC_URL}/data/knowledgedistillation-combined.json`);
          if (!response.ok) {
            throw new Error('Failed to load questions');
          }
          const data = await response.json();
          
          const reviewData = await fetchReviewData(domain, userEmail);
          
          const filteredData = data.filter(item => {
            const questionId = item.qid.toString();
            const userHasReviewed = reviewData.userReviewed.has(questionId);
            const reviewCount = reviewData.reviewCounts[questionId] || 0;
            const hasThreeReviews = reviewCount >= 3;
            
            return !userHasReviewed && !hasThreeReviews;
          });
          
          console.log(`Total questions: ${data.length}`);
          console.log(`Available questions: ${filteredData.length}`);
          console.log(`User reviewed: ${reviewData.userReviewedCount}`);
          
          // Shuffle questions for variety
          const shuffledQuestions = [...filteredData].sort(() => Math.random() - 0.5);
          
          const transformedQuestions = shuffledQuestions.map(item => ({
            id: item.qid.toString(),
            text: item.question,
            polymer_details: item.polymer_details,
            answers: [
              {
                id: `${item.qid}_answer1`,
                text: item.answer1,
                label: "Answer 1"
              },
              {
                id: `${item.qid}_answer2`,
                text: item.answer2,
                label: "Answer 2"
              },
              {
                id: `${item.qid}_answer3`, 
                text: item.answer3,
                label: "Answer 3"
              }
            ]
          }));
          
          setQuestions(transformedQuestions);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading questions:', error);
        setIsLoading(false);
      }
    };

    if (userEmail) {
      loadQuestions();
    }
  }, [domain, userEmail]);

  // Select question by index
  const selectQuestion = (index) => {
    if (questions.length > 0 && index < questions.length) {
      const selectedQuestion = questions[index];
      
      setCurrentQuestion(selectedQuestion);
      setCurrentQuestionIndex(index);
      setAnswersRatings({});
      setAnswerComments({});
      setFeedbackRecorded(false);
      
      // Reset rating systems
      Object.values(ratingSystemRefs.current).forEach(ref => {
        if (ref && ref.resetRatings) {
          ref.resetRatings();
        }
      });
      
      console.log(`Selected question ${index + 1} of ${questions.length}: ${selectedQuestion.id}`);
    }
  };

  // Skip to a random question that hasn't been completed yet
  const skipToRandomQuestion = () => {
    const availableIndices = questions
      .map((_, index) => index)
      .filter(index => index !== currentQuestionIndex && !completedQuestions.has(index));
    
    if (availableIndices.length > 0) {
      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      selectQuestion(randomIndex);
    } else {
      // All questions in session completed, show completion
      setCurrentQuestion(null);
    }
  };

  // Select first question when questions are loaded
  useEffect(() => {
    if (questions.length > 0 && !currentQuestion) {
      selectQuestion(0);
    }
  }, [questions]);

  // Typeset math when question changes
  useEffect(() => {
    if (currentQuestion && window.MathJax) {
      setTimeout(() => window.MathJax.typeset(), 100);
    }
  }, [currentQuestion]);

  const handleRatingChange = (answerId, newRatings) => {
    setAnswersRatings(prev => ({
      ...prev,
      [answerId]: newRatings
    }));
  };

  const handleAnswerCommentChange = (answerId, comment) => {
    setAnswerComments(prev => ({
      ...prev,
      [answerId]: comment
    }));
  };

  const handleRecordFeedback = () => {
    const allOverallRated = currentQuestion.answers.every(answer => {
      const ratings = answersRatings[answer.id];
      return ratings && ratings.overall > 0;
    });
    
    if (!allOverallRated) {
      alert('Please provide an Overall Rating for all answers before submitting.');
      return;
    }

    setIsSubmitting(true);

    const response = {
      timestamp: new Date().toISOString(),
      domain,
      userEmail,
      questionId: currentQuestion.id,
      questionText: currentQuestion.text,
      polymerDetails: currentQuestion.polymer_details,
      answers: currentQuestion.answers.map(answer => ({
        id: answer.id,
        text: answer.text,
        label: answer.label,
        ratings: answersRatings[answer.id],
        comment: answerComments[answer.id] || ''
      }))
    };

    submitToGoogleSheets(response);
    onSubmitResponse(response);
    
    // Mark this question as completed
    setCompletedQuestions(prev => new Set([...prev, currentQuestionIndex]));
    setFeedbackRecorded(true);
    setSessionCompleted(prev => prev + 1);
    setIsSubmitting(false);
  };

  const handleNextQuestion = () => {
    if (!feedbackRecorded) {
      alert('Please record your feedback first.');
      return;
    }
    
    // Find next available question sequentially
    let nextIndex = currentQuestionIndex + 1;
    while (nextIndex < questions.length && completedQuestions.has(nextIndex)) {
      nextIndex++;
    }
    
    if (nextIndex < questions.length) {
      // Found a sequential question
      selectQuestion(nextIndex);
    } else {
      // No more sequential questions, try random from remaining
      const availableIndices = questions
        .map((_, index) => index)
        .filter(index => !completedQuestions.has(index));
      
      if (availableIndices.length > 0) {
        const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        selectQuestion(randomIndex);
      } else {
        // All questions completed in this session
        setCurrentQuestion(null);
      }
    }
  };

  // Handle clicking on question text to skip
  const handleQuestionClick = () => {
    if (feedbackRecorded) {
      skipToRandomQuestion();
    } else {
      const confirmSkip = window.confirm('Skip this question without recording feedback?');
      if (confirmSkip) {
        skipToRandomQuestion();
      }
    }
  };

  if (isLoading) {
    return <div className="loading">Loading questions...</div>;
  }

  if (!currentQuestion) {
    return (
      <div className="completion-message">
        <h2>🎉 All Done!</h2>
        <div className="completion-stats">
          <p><strong>Congratulations!</strong> You have completed all available Knowledge Distillation questions.</p>
          {sessionCompleted > 0 && (
            <p>You completed <strong>{sessionCompleted} questions</strong> in this session.</p>
          )}
          <div className="completion-details">
            <p>You have either:</p>
            <ul>
              <li>Reviewed all questions assigned to you, or</li>
              <li>All remaining questions have reached the maximum number of reviews (3)</li>
            </ul>
          </div>
          <button 
            className="domain-change-button"
            onClick={() => window.location.href = process.env.PUBLIC_URL || '/'}
          >
            Try Response Preference Task
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="question-review knowledge-distillation">
      <h2>Knowledge Distillation - Rate Each Answer</h2>
      
      {/* Progress indicator */}
      <div className="progress-indicator">
        <span>Question {currentQuestionIndex + 1} of {questions.length} available</span>
        {sessionCompleted > 0 && (
          <span className="session-progress"> | Completed this session: {sessionCompleted}</span>
        )}
      </div>
      
      <div className="two-column-layout">
        {/* LEFT COLUMN - Question and Polymer Details */}
        <div className="left-column">
          <div className="question-section">
            <h3>Question:</h3>
            <div 
              className="question-text clickable-question"
              dangerouslySetInnerHTML={{ __html: currentQuestion.text }}
              onClick={handleQuestionClick}
              title="Click to skip to a different question"
            />
          </div>
          
          <div className="polymer-section">
          <h3>Polymer Details | Ground Truth:</h3>
          <div className="polymer-details-structured">
            {parsePolymerDetails(currentQuestion.polymer_details)}
            
            <div className="ground-truth-note" style={{ 
              marginTop: '15px', 
              padding: '10px', 
              backgroundColor: '#f8f9fa', 
              borderLeft: '3px solid #007bff',
              fontSize: '0.9em' 
            }}>
              <strong>Note:</strong> For MCQ, ranking, property prediction, and counting tasks, 
              the answer shown is the ground truth reference. For open-ended QA tasks, the reference 
              answer is candidate-generated and should be ignored for evaluation purposes.
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Answers and Ratings */}
        <div className="right-column">
          {currentQuestion.answers.map((answer, index) => (
            <div key={answer.id}>
              <div className="answer-block">
                <h3 className="answer-header">{answer.label}</h3>
                
                <div
                  className="answer-content"
                  dangerouslySetInnerHTML={{ __html: answer.text }}
                />
                
                <div className="rating-section">
                  <h4>Rate this answer:</h4>
                  <RatingSystem 
                    onRatingChange={(ratings) => handleRatingChange(answer.id, ratings)} 
                    ref={(el) => {
                      if (el) {
                        ratingSystemRefs.current[answer.id] = el;
                      }
                    }}
                  />
                </div>
                
                <div className="answer-comment-section">
                  <h4>Comments:</h4>
                  <textarea 
                    className="answer-comment-textarea"
                    value={answerComments[answer.id] || ''}
                    onChange={(e) => handleAnswerCommentChange(answer.id, e.target.value)}
                    placeholder={`Comments for ${answer.label}...`}
                    rows={3}
                  />
                </div>
              </div>
              
              {index < currentQuestion.answers.length - 1 && (
                <div className="answer-separator"></div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="action-buttons">
        <button 
          className="skip-button"
          onClick={skipToRandomQuestion}
          disabled={isSubmitting}
        >
          Skip Question
        </button>
        
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
          Next Question
        </button>
      </div>
    </div>
  );
}

export default QuestionReview;