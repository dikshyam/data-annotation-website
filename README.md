# Data Annotation Website

A GitHub Pages website for scientific answer annotation with separate "Record Feedback" and "Review Another Question" buttons.

## Project Overview

This project consists of two parts:
1. A React frontend (deployed on GitHub Pages)
2. A Python Flask backend (for question selection logic)

## Setup Instructions

### Frontend Setup (GitHub Pages)

1. Clone the repository
   ```bash
   git clone https://github.com/dikshyam/data-annotation-website.git
   cd data-annotation-website
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Update the React components with the separate buttons
   - Replace `src/components/QuestionReview.js` with the updated version
   - Add the new button styles to `src/styles/main.css`

4. Build and deploy to GitHub Pages
   ```bash
   npm run build
   npm run deploy
   ```

### Python Backend Setup

1. Create a new directory for the backend
   ```bash
   mkdir data-annotation-backend
   cd data-annotation-backend
   ```

2. Create a virtual environment
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install required packages
   ```bash
   pip install flask flask-cors
   ```

4. Copy the Python files from this repository
   - `app.py` - The Flask API
   - `initialize_questions.py` - Script to create sample question data

5. Run the initialization script
   ```bash
   python initialize_questions.py
   ```

6. Start the Flask server
   ```bash
   python app.py
   ```

The Flask API will run on `http://localhost:5000` by default.

## Integrating Frontend with Backend

To connect your React frontend with the Python backend, you'll need to modify the React components to fetch questions from the API instead of loading them from static JSON files.

### Update the React Component

Update your `App.js` to include:

```javascript
const API_URL = 'http://localhost:5000/api'; // Change to your deployed API URL

// Inside your component
const fetchRandomQuestion = async (domain) => {
  const userId = localStorage.getItem('userId') || 'anonymous';
  const response = await fetch(`${API_URL}/question?domain=${domain}&user_id=${userId}`);
  
  if (response.status === 204) {
    // All questions reviewed
    navigate('/thank-you');
    return null;
  }
  
  if (!response.ok) {
    throw new Error('Failed to fetch question');
  }
  
  return await response.json();
};

const submitResponse = async (responseData) => {
  const userId = localStorage.getItem('userId') || 'anonymous';
  const response = await fetch(`${API_URL}/response`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...responseData,
      user_id: userId
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit response');
  }
  
  return await response.json();
};
```

### Deployment Options for the Python Backend

1. **Local Development**: Run the Flask server locally during development.

2. **Heroku Deployment**:
   - Create a `requirements.txt` file with the dependencies
   - Create a `Procfile` with: `web: gunicorn app:app`
   - Install Gunicorn: `pip install gunicorn`
   - Deploy to Heroku using their CLI

3. **PythonAnywhere**:
   - Create an account on PythonAnywhere
   - Upload your files
   - Set up a web app pointing to your Flask application

4. **AWS Lambda/API Gateway**:
   - Convert the Flask app to Lambda functions
   - Set up API Gateway endpoints

## Additional Features

- User authentication
- Admin dashboard for viewing statistics
- Export annotated data to CSV/Excel
- Integration with a database for persistent storage

## License

MIT