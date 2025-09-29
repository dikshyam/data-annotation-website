const submitToGoogleSheets = (response) => {
  // Check if this is a preference evaluation or regular evaluation
  const isPreferenceEvaluation = response.domain === 'Response Preference' || response.hasOwnProperty('preferredAnswer');
  
  if (isPreferenceEvaluation) {
    submitPreferenceData(response);
  } else {
    submitRegularData(response);
  }
};

// For Response Preference evaluations
// For Response Preference evaluations
const submitPreferenceData = (response) => {
  // Prepare preference-specific data structure
  const data = {
    timestamp: response.timestamp,
    domain: response.domain,
    userEmail: response.userEmail,
    questionId: response.questionId,
    questionText: response.questionText,
    qid: response.qid,
    question_type: response.question_type,
    preferredAnswer: response.preferredAnswer,
    answers: response.answers.map(answer => ({
      id: answer.id,
      label: answer.label,
      text: answer.text,
      isPreferred: answer.isPreferred || answer.id === response.preferredAnswer,
      ratings: {
        overall: answer.ratings?.overall || 0,
        accuracy: answer.ratings?.accuracy || 0,
        helpfulness: answer.ratings?.helpfulness || 0,
        clarity: answer.ratings?.clarity || 0,
        completeness: answer.ratings?.completeness || 0
      }
    })),
    generalComments: response.generalComments
  };

  console.log('Submitting data:', JSON.stringify(data, null, 2));

  // Submit to preference-specific Google Sheets endpoint
  fetch('https://script.google.com/macros/s/AKfycbxv-kGgCXL2Q5OWq5c4VeboIu9uzpst_nAof4jcAd-pXZO1FuaZIhuAfesZExdxs5Yotw/exec', {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
  .then(() => console.log('Preference data submitted to Google Sheets'))
  .catch(error => console.error('Error submitting preference data:', error));
};

// For Knowledge Distillation evaluations (existing structure)
const submitRegularData = (response) => {
  const data = {
    timestamp: response.timestamp,
    domain: response.domain,
    userEmail: response.userEmail,
    questionId: response.questionId,
    questionText: response.questionText,
    polymerDetails: response.polymerDetails,
    answers: response.answers,
    // generalComments: response.generalComments
  };

  // Submit to existing Google Sheets endpoint
  fetch('https://script.google.com/macros/s/AKfycbzKEgPf6pUzP86rsz7ZK095AScLbBwff4OqoERQD9b6B_b3Fl49VO_1yje2sGsO87NMkQ/exec', {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
  .then(() => console.log('Regular feedback submitted to Google Sheets'))
  .catch(error => console.error('Error submitting regular feedback:', error));
};

export default submitToGoogleSheets;