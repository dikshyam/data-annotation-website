// GoogleSheetsSubmit.js - Direct submission to Google Sheets

// This function submits the data directly to a Google Sheets Web App
const submitToGoogleSheets = (response) => {
    // Prepare the data
    const data = {
      timestamp: new Date().toISOString(),
      domain: response.domain,
      questionId: response.questionId,
      questionText: response.questionText,
      answerId: response.answerId, 
      answerText: response.answerText,
      reasoningRating: response.ratings.reasoning,
      accuracyRating: response.ratings.accuracy,
      domainKnowledgeRating: response.ratings.domainKnowledge,
      creativityRating: response.ratings.creativity,
      difficultyRating: response.ratings.difficulty,
      comment: response.comment || ''
    };
  
    // Submit the data to Google Sheets Web App
    fetch('https://script.google.com/macros/s/AKfycby_u4axlSTCiOWQfiLNRTYjQm-NSEtK44POND3sM_ne1Kg-kxAvGarkwgSn1G_KlsMw/exec', {
      method: 'POST',
      mode: 'no-cors', // Important to prevent CORS issues
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
    .then(() => console.log('Feedback submitted to Google Sheets'))
    .catch(error => console.error('Error submitting feedback:', error));
  };
  
  export default submitToGoogleSheets;