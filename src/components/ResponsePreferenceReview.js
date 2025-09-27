// ResponsePreferenceReview.js - Adapted from QuestionReview.js for preference evaluation
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PreferenceRatingSystem from './PreferenceRatingSystem';
import submitToGoogleSheets from '../utils/GoogleSheetsSubmit';

function ResponsePreferenceReview({ domain, onSubmitResponse }) {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [preferredAnswer, setPreferredAnswer] = useState('');
  const [answersRatings, setAnswersRatings] = useState({});
  const [comments, setComments] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewedQuestions, setReviewedQuestions] = useState({});
  const [feedbackRecorded, setFeedbackRecorded] = useState(false);
  const [activeTab, setActiveTab] = useState('preference');
  
  // Create refs for the PreferenceRatingSystem components
  const ratingSystemRefs = useRef({});

  // Load questions based on selected domain
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch('../data/response-preference-questions.json');
        // const response = await fetch('https://drive.google.com/uc?export=download&id=1F9Zu21PwDIyzjzl--3BE1DCbzL1ZLziv');
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
    
    // Load reviewed questions from localStorage
    const savedReviewedQuestions = localStorage.getItem('reviewedQuestions');
    if (savedReviewedQuestions) {
      setReviewedQuestions(JSON.parse(savedReviewedQuestions));
    }
  }, [domain]);

  // Select a question when questions are loaded
  useEffect(() => {
    if (questions.length > 0 && !currentQuestion) {
      selectPrioritizedQuestion();
    }
  }, [questions, reviewedQuestions, currentQuestion]);

  // Typeset math when question changes
  useEffect(() => {
    if (currentQuestion && window.MathJax) {
      setTimeout(() => {
        window.MathJax.typeset();
      }, 100);
    }
  }, [currentQuestion]);

  // Save reviewed questions to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('reviewedQuestions', JSON.stringify(reviewedQuestions));
  }, [reviewedQuestions]);

  // Get review count for a specific question
  const getQuestionReviewCount = (questionId) => {
    return reviewedQuestions[questionId] || 0;
  };

  // Select a question with prioritization (least reviewed first)
  const selectPrioritizedQuestion = () => {
    if (questions.length === 0) {
      console.error('No questions available');
      return;
    }
    
    // Find the minimum review count among all questions
    const minReviewCount = Math.min(...questions.map(q => getQuestionReviewCount(q.id)));
    
    // Filter to get only questions with the minimum review count
    const priorityQuestions = questions.filter(q => getQuestionReviewCount(q.id) === minReviewCount);
    
    // Randomly select one of the priority questions
    const randomIndex = Math.floor(Math.random() * priorityQuestions.length);
    const selectedQuestion = priorityQuestions[randomIndex];
    
    // Reset all state for the new question
    setCurrentQuestion(selectedQuestion);
    setPreferredAnswer('');
    setAnswersRatings({});
    setComments('');
    setFeedbackRecorded(false);
    setActiveTab('preference');
    
    // Reset all rating systems
    Object.values(ratingSystemRefs.current).forEach(ref => {
      if (ref && ref.resetRatings) {
        ref.resetRatings();
      }
    });
    
    console.log(`Selected question: ${selectedQuestion.id} (Review count: ${minReviewCount})`);
  };

  const handlePreferenceChange = (answerId) => {
    setPreferredAnswer(answerId);
  };

  const handleRatingChange = (answerId, newRatings) => {
    setAnswersRatings(prev => ({
      ...prev,
      [answerId]: newRatings
    }));
  };

  const handleCommentsChange = (e) => {
    setComments(e.target.value);
  };

  const handleRecordFeedback = () => {
    // Check if preference is selected
    if (!preferredAnswer) {
      alert('Please select your preferred answer first.');
      return;
    }

    // Check if all answers have been rated (at least overall rating)
    const allAnswersRated = currentQuestion.answers.every(answer => {
      const ratings = answersRatings[answer.id];
      return ratings && ratings.overall > 0;
    });
    
    if (!allAnswersRated) {
      alert('Please provide an overall rating for each answer before submitting.');
      return;
    }

    setIsSubmitting(true);

    // Create response object
    const response = {
      timestamp: new Date().toISOString(),
      domain,
      questionId: currentQuestion.id,
      questionText: currentQuestion.text,
      qid: currentQuestion.qid,
      question_type: currentQuestion.question_type,
      preferredAnswer: preferredAnswer,
      answers: currentQuestion.answers.map(answer => ({
        id: answer.id,
        label: answer.label,
        text: answer.text,
        ratings: answersRatings[answer.id],
        isPreferred: answer.id === preferredAnswer
      })),
      generalComments: comments
    };

    // Submit to Google Sheets
    submitToGoogleSheets(response);

    // Submit the response to local storage
    onSubmitResponse(response);
    
    // Update the review count for this question
    const currentCount = reviewedQuestions[currentQuestion.id] || 0;
    setReviewedQuestions(prev => ({
      ...prev,
      [currentQuestion.id]: currentCount + 1
    }));
    
    // Mark feedback as recorded
    setFeedbackRecorded(true);
    setIsSubmitting(false);
  };

  const handleNextQuestion = () => {
    if (!feedbackRecorded) {
      // Ask for confirmation instead of blocking
      if (window.confirm('You haven\'t recorded feedback for this question. Skip to the next question anyway?')) {
        selectPrioritizedQuestion();
      }
    } else {
      selectPrioritizedQuestion();
    }
  };

  if (isLoading) {
    return <div className="loading">Loading questions...</div>;
  }

  if (!currentQuestion) {
    return <div className="error">No questions available</div>;
  }

  return (
    <div className="response-preference-review">
      <h2>Response Preference Evaluation</h2>
      
      <div className="question-container">
        <h3>Question:</h3>
        <div 
          className="question-text clickable-question"
          dangerouslySetInnerHTML={{ __html: currentQuestion.text }}
          onClick={handleNextQuestion}
          title="Click to generate another question"
        />
        
        {/* Display experimental properties if they exist */}
        {currentQuestion.qid && (
          <div className="question-meta">
            <p><strong>Question ID:</strong> {currentQuestion.qid}</p>
            {currentQuestion.question_type && (
              <p><strong>Type:</strong> {currentQuestion.question_type}</p>
            )}
          </div>
        )}
      </div>


      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'preference' ? 'active' : ''}`}
          onClick={() => setActiveTab('preference')}
        >
          Choose Preference
        </button>
        <button 
          className={`tab-button ${activeTab === 'ratings' ? 'active' : ''}`}
          onClick={() => setActiveTab('ratings')}
          disabled={!preferredAnswer}
        >
          Rate Answers {!preferredAnswer && '(Select preference first)'}
        </button>
        <button 
          className={`tab-button ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          Comments
        </button>
      </div>

      {/* Preference Selection Tab */}
      {activeTab === 'preference' && (
        <div className="preference-tab">
          <div className="preference-instruction">
            <h3>Overall Preference</h3>
            <p>Please read all responses below and select which one you prefer overall:</p>
          </div>
          
          {currentQuestion.answers.map((answer, index) => (
            <div key={answer.id} className="preference-option">
              <div className="preference-header">
                <input
                  type="radio"
                  id={`pref-${answer.id}`}
                  name="preference"
                  value={answer.id}
                  checked={preferredAnswer === answer.id}
                  onChange={() => handlePreferenceChange(answer.id)}
                />
              <label htmlFor={`pref-${answer.id}`} className="preference-label">
                <strong>Answer {index + 1}</strong>
              </label>
              </div>
              <div
                className="answer-text preference-answer"
                dangerouslySetInnerHTML={{ __html: answer.text }}
              />
            </div>
          ))}
          
          {preferredAnswer && (
            <div className="preference-confirmation">
            <p>✓ You selected Answer {currentQuestion.answers.findIndex(a => a.id === preferredAnswer) + 1}.</p>
            <button 
                className="continue-to-ratings-button"
                onClick={() => setActiveTab('ratings')}
              >
                Continue to Detailed Ratings
              </button>
            </div>
          )}
        </div>
      )}

      {/* Ratings Tab */}
      {activeTab === 'ratings' && (
        <div className="ratings-tab">
          {currentQuestion.answers.map((answer, index) => (
            <div key={answer.id} className="answer-rating-container">
              <h3>Answer {index + 1}:</h3>
              <div
                className="answer-text"
                dangerouslySetInnerHTML={{ __html: answer.text }}
              />
              
              <h4>Rate this response:</h4>
              <PreferenceRatingSystem 
                onRatingChange={(ratings) => handleRatingChange(answer.id, ratings)}
                isPreferred={answer.id === preferredAnswer}
                ref={(el) => {
                  if (el) {
                    ratingSystemRefs.current[answer.id] = el;
                  }
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Comments Tab */}
      {activeTab === 'comments' && (
        <div className="comments-tab">
          <div className="general-comments-container">
            <h3>General Comments:</h3>
            <textarea 
              className="comment-textarea"
              value={comments}
              onChange={handleCommentsChange}
              placeholder="Add general feedback about the question or overall comparison of responses..."
              rows={12}
            />
          </div>
        </div>
      )}
      
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

export default ResponsePreferenceReview;