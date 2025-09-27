// QuestionReview.js - Updated for 3 answers per question
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import RatingSystem from './RatingSystem';
import submitToGoogleSheets from '../utils/GoogleSheetsSubmit';

function QuestionReview({ domain, onSubmitResponse }) {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answersRatings, setAnswersRatings] = useState({}); // Ratings for all 3 answers
  const [comments, setComments] = useState(''); // General comments
  const [answerComments, setAnswerComments] = useState({}); // Individual answer comments
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewedQuestions, setReviewedQuestions] = useState({});
  const [feedbackRecorded, setFeedbackRecorded] = useState(false);
  const [activeTab, setActiveTab] = useState('ratings'); // 'ratings' or 'comments'
  
  // Create refs for the RatingSystem components
  const ratingSystemRefs = useRef({});

  // Load questions based on selected domain
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        let response;
        
        // Handle specific file names for each domain
        if (domain === 'Knowledge Distillation') {
          response = await fetch(`./data/knowledgedistillation-combined.json`);
        } else if (domain === 'Response Preference') {
          // You'll need to create this file or update the name
          response = await fetch(`./data/response-preference-questions.json`);
        } else {
          // Fallback to the original naming convention
          const normalizedDomain = domain.toLowerCase().replace(' ', '-');
          response = await fetch(`${process.env.PUBLIC_URL}/data/${normalizedDomain}-questions.json`);
        }
        
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
    console.log('Questions loaded:', questions.length);
    if (questions.length > 0 && !currentQuestion) {
      selectPrioritizedQuestion();
    }
  }, [questions, reviewedQuestions]);
  

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
    console.log('Selecting question from:', questions.length, 'available questions');
    if (questions.length === 0) {
      console.error('No questions available for selection');
      return;
    }
    
    // Rest of your existing logic...
    

    // Find the minimum review count among all questions
    const minReviewCount = Math.min(...questions.map(q => getQuestionReviewCount(q.id)));
    
    // Filter to get only questions with the minimum review count
    const priorityQuestions = questions.filter(q => getQuestionReviewCount(q.id) === minReviewCount);
    
    // Randomly select one of the priority questions
    const randomIndex = Math.floor(Math.random() * priorityQuestions.length);
    const selectedQuestion = priorityQuestions[randomIndex];
    console.log('Selected question:', selectedQuestion);

    // Reset all state for the new question
    setCurrentQuestion(selectedQuestion);
    setAnswersRatings({});
    setComments('');
    setAnswerComments({});
    setFeedbackRecorded(false);
    setActiveTab('ratings');
    
    // Reset all rating systems
    Object.values(ratingSystemRefs.current).forEach(ref => {
      if (ref && ref.resetRatings) {
        ref.resetRatings();
      }
    });
    
    console.log(`Selected question: ${selectedQuestion.id} (Review count: ${minReviewCount})`);
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

  const handleAnswerCommentChange = (answerId, comment) => {
    setAnswerComments(prev => ({
      ...prev,
      [answerId]: comment
    }));
  };

  const handleRecordFeedback = () => {
    // Check if all answers have been rated
    const allAnswersRated = currentQuestion.answers.every(answer => {
      const ratings = answersRatings[answer.id];
      return ratings && Object.values(ratings).every(rating => rating > 0);
    });
    
    if (!allAnswersRated) {
      alert('Please rate all criteria for all answers before submitting.');
      return;
    }

    setIsSubmitting(true);

    // Create response object
    const response = {
      timestamp: new Date().toISOString(),
      domain,
      questionId: currentQuestion.id,
      questionText: currentQuestion.text,
      experimentalProperties: currentQuestion.experimentalProperties || {},
      answers: currentQuestion.answers.map(answer => ({
        id: answer.id,
        text: answer.text,
        ratings: answersRatings[answer.id],
        comment: answerComments[answer.id] || ''
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
    <div className="question-review">
      <h2>Review Question</h2>
      
      <div className="question-container">
        <h3>Question:</h3>
        <div 
          className="question-text"
          dangerouslySetInnerHTML={{ __html: currentQuestion.text }}
        />
        
        {/* Display experimental properties if they exist */}
        {currentQuestion.experimentalProperties && Object.keys(currentQuestion.experimentalProperties).length > 0 && (
          <div className="experimental-properties">
            <h4>Experimental Properties:</h4>
            <ul>
              {Object.entries(currentQuestion.experimentalProperties).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong> {value}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'ratings' ? 'active' : ''}`}
          onClick={() => setActiveTab('ratings')}
        >
          Rate Answers
        </button>
        <button 
          className={`tab-button ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          Comments
        </button>
      </div>

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
              placeholder="Add general feedback about the question or overall comparison..."
              rows={8}
            />
          </div>
          
          {currentQuestion.answers.map((answer, index) => (
            <div key={answer.id} className="answer-comment-container">
              <h3>Comments for Answer {index + 1}:</h3>
              <div
                className="answer-text-preview"
                dangerouslySetInnerHTML={{ __html: answer.text.substring(0, 200) + (answer.text.length > 200 ? '...' : '') }}
              />
              <textarea 
                className="comment-textarea"
                value={answerComments[answer.id] || ''}
                onChange={(e) => handleAnswerCommentChange(answer.id, e.target.value)}
                placeholder={`Add specific feedback for answer ${index + 1}...`}
                rows={4}
              />
            </div>
          ))}
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

export default QuestionReview;