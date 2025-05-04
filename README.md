# Data Annotation Website

A simple website for scientific answer annotation in Material Science and Chemistry domains.

## Features

- Domain selection (Material Science or Chemistry)
- Random question and answer review
- 5-criteria rating system (Reasoning, Accuracy, Domain Knowledge, Creativity, Difficulty)
- Separate "Record Feedback" and "Review Another Question" buttons
- Results stored locally

## Live Demo

Visit the live site: [Data Annotation Website](https://dikshyam.github.io/data-annotation-website/)

## Local Development

```bash
# Clone the repository
git clone https://github.com/dikshyam/data-annotation-website.git
cd data-annotation-website

# Install dependencies
npm install

# Start local development server
npm start

# Build and deploy
npm run build
npm run deploy
```

## Optional Python Backend

For advanced question selection logic, a Python Flask backend is available.

```bash
# Setup Python environment
python3 -m venv venv
source venv/bin/activate
pip install flask flask-cors

# Run the server
python app.py
```