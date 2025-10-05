// ResponsePreferenceReview.js - With session tracking + skip feature
import React, { useState, useEffect, useRef } from 'react';
import PreferenceRatingSystem from './PreferenceRatingSystem';
import submitToGoogleSheets from '../utils/GoogleSheetsSubmit';

function ResponsePreferenceReview({ domain, userEmail, onSubmitResponse }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [preferredAnswer, setPreferredAnswer] = useState('');
  const [answersRatings, setAnswersRatings] = useState({});
  const [comments, setComments] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackRecorded, setFeedbackRecorded] = useState(false);
  const [activeTab, setActiveTab] = useState('preference');
  const [sessionCompleted, setSessionCompleted] = useState(0);
  const [skippedQuestions, setSkippedQuestions] = useState(new Set()); // Track skipped in session
  
  const ratingSystemRefs = useRef({});

  // Helper function to fetch review data from Google Sheets
  const fetchReviewData = async (domain, userEmail) => {
    try {
      const response = await fetch(`https://script.google.com/macros/s/AKfycbxv-kGgCXL2Q5OWq5c4VeboIu9uzpst_nAof4jcAd-pXZO1FuaZIhuAfesZExdxs5Yotw/exec?action=getAvailableQuestions&domain=${encodeURIComponent(domain)}&userEmail=${encodeURIComponent(userEmail)}`);
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

  // Load questions
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        if (domain === 'Response Preference' && userEmail) {
          const response = await fetch(`${process.env.PUBLIC_URL}/data/response-preference-questions_polybench_v4.json`);
          if (!response.ok) {
            throw new Error('Failed to load questions');
          }
          const data = await response.json();
          
          const reviewData = await fetchReviewData(domain, userEmail);
          
          const filteredQuestions = data.questions.filter(question => {
            const questionId = question.id.toString();
            const userHasReviewed = reviewData.userReviewed.has(questionId);
            const reviewCount = reviewData.reviewCounts[questionId] || 0;
            const hasThreeReviews = reviewCount >= 3;
            
            return !userHasReviewed && !hasThreeReviews;
          });
          
          console.log(`Available questions: ${filteredQuestions.length}`);
          
          // Shuffle questions for variety
          const shuffledQuestions = [...filteredQuestions].sort(() => Math.random() - 0.5);
          setQuestions(shuffledQuestions);
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
      setPreferredAnswer('');
      setAnswersRatings({});
      setComments('');
      setFeedbackRecorded(false);
      setActiveTab('preference');
      
      // Reset rating systems
      Object.values(ratingSystemRefs.current).forEach(ref => {
        if (ref && ref.resetRatings) {
          ref.resetRatings();
        }
      });
      
      console.log(`Selected question ${index + 1} of ${questions.length}: ${selectedQuestion.id}`);
    }
  };

  // Skip to a random question that hasn't been skipped yet
  const skipToRandomQuestion = () => {
    const availableIndices = questions
      .map((_, index) => index)
      .filter(index => index !== currentQuestionIndex && !skippedQuestions.has(index));
    
    if (availableIndices.length > 0) {
      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      setSkippedQuestions(prev => new Set([...prev, currentQuestionIndex]));
      selectQuestion(randomIndex);
    } else {
      // Instead of reloading, show completion message
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
    if (!preferredAnswer) {
      alert('Please select your preferred answer first.');
      return;
    }

    const allAnswersRated = currentQuestion.answers.every(answer => {
      const ratings = answersRatings[answer.id];
      return ratings && ratings.overall > 0;
    });
    
    if (!allAnswersRated) {
      alert('Please provide an overall rating for each answer before submitting.');
      return;
    }

    setIsSubmitting(true);

    const response = {
      timestamp: new Date().toISOString(),
      domain,
      userEmail,
      questionId: currentQuestion.id,
      questionText: currentQuestion.text,
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

    submitToGoogleSheets(response);
    onSubmitResponse(response);
    
    setFeedbackRecorded(true);
    setSessionCompleted(prev => prev + 1);
    setIsSubmitting(false);
  };

  // const handleNextQuestion = () => {
  //   if (!feedbackRecorded) {
  //     alert('Please record your feedback first.');
  //     return;
  //   }
    
  //   const nextIndex = currentQuestionIndex + 1;
  //   if (nextIndex < questions.length && !skippedQuestions.has(nextIndex)) {
  //     // Move to next question in sequence
  //     selectQuestion(nextIndex);
  //   } else {
  //     // Find next available question or reload
  //     skipToRandomQuestion();
  //   }
  // };

  // Handle clicking on question text to skip
  const handleNextQuestion = () => {
    if (!feedbackRecorded) {
      alert('Please record your feedback first.');
      return;
    }
    
    // Mark current question as completed (not skipped)
    const completedQuestions = new Set([...skippedQuestions, currentQuestionIndex]);
    
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
    
    // Update skipped questions to include completed ones
    setSkippedQuestions(completedQuestions);
  };

  if (isLoading) {
    return <div className="loading">Loading questions...</div>;
  }
  
  // Add the completion check here
  if (!currentQuestion) {
    return (
      <div className="completion-message">
        <h2>🎉 All Done!</h2>
        <div className="completion-stats">
          <p><strong>Congratulations!</strong> You have completed all available Response Preference questions.</p>
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
            Try Knowledge Distillation Task
          </button>
        </div>
      </div>
    );
  }
  

  return (
    <div className="response-preference-review">
      <h2>Response Preference Evaluation</h2>
      
      {/* Progress indicator */}
      <div className="progress-indicator">
        <span>Question {currentQuestionIndex + 1} of {questions.length} available</span>
        {sessionCompleted > 0 && (
          <span className="session-progress"> | Completed this session: {sessionCompleted}</span>
        )}
      </div>
      
      <div className="question-container">
        <h3>Question:</h3>
        <div 
          // className="question-text clickable-question"
          dangerouslySetInnerHTML={{ __html: currentQuestion.text }}
          // onClick={handleQuestionClick}
          // title="Click to skip to a different question"
        />
        
        
        {currentQuestion.qid && (
          <div className="question-meta">
            <p><strong>Question ID:</strong> {currentQuestion.qid}</p>
            {currentQuestion.question_type && (
              <>
                <p><strong>Type:</strong> {currentQuestion.question_type}</p>
                <p><strong>Reference Answer (Generated from Answer 1):</strong> {currentQuestion.reference_answer}</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Rest of your existing JSX... */}
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

      {/* Your existing tabs... */}
      {activeTab === 'preference' && (
        <div className="preference-tab">
          <div className="preference-instruction">
            <h3>Select Your Preferred Answer</h3>
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
              <h3>
                Answer {index + 1}
                {answer.id === preferredAnswer && <span className="preferred-badge">⭐ Preferred</span>}
              </h3>
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
              placeholder="Add general feedback about the question or explain your preference choice..."
              rows={8}
            />
          </div>
        </div>
      )}
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

export default ResponsePreferenceReview;