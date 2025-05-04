#!/usr/bin/env python3
"""
Question Selection API for Data Annotation Website

This script provides a Flask API that handles question selection logic for
the data annotation website. It selects random questions based on domain
and tracks which questions have already been reviewed.
"""

import os
import json
import random
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Data storage paths
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
RESPONSES_FILE = os.path.join(DATA_DIR, 'responses.json')
REVIEWED_FILE = os.path.join(DATA_DIR, 'reviewed_questions.json')

# Create data directory if it doesn't exist
os.makedirs(DATA_DIR, exist_ok=True)

# Initialize data files if they don't exist
if not os.path.exists(RESPONSES_FILE):
    with open(RESPONSES_FILE, 'w') as f:
        json.dump([], f)

if not os.path.exists(REVIEWED_FILE):
    with open(REVIEWED_FILE, 'w') as f:
        json.dump({}, f)


def load_domain_questions(domain):
    """Load questions for a specific domain from JSON file."""
    domain_file = os.path.join(DATA_DIR, f"{domain.lower().replace(' ', '-')}-questions.json")
    try:
        with open(domain_file, 'r') as f:
            return json.load(f)['questions']
    except (FileNotFoundError, json.JSONDecodeError, KeyError) as e:
        print(f"Error loading domain questions: {e}")
        return []


def load_reviewed_questions():
    """Load the list of questions that have already been reviewed."""
    try:
        with open(REVIEWED_FILE, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading reviewed questions: {e}")
        return {}


def save_reviewed_question(user_id, question_id):
    """Save a question as reviewed for a specific user."""
    reviewed = load_reviewed_questions()
    
    if user_id not in reviewed:
        reviewed[user_id] = []
    
    if question_id not in reviewed[user_id]:
        reviewed[user_id].append(question_id)
    
    with open(REVIEWED_FILE, 'w') as f:
        json.dump(reviewed, f)


def save_response(response_data):
    """Save a user's response to the responses file."""
    try:
        with open(RESPONSES_FILE, 'r') as f:
            responses = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        responses = []
    
    # Add timestamp to the response
    response_data['timestamp'] = datetime.now().isoformat()
    
    responses.append(response_data)
    
    with open(RESPONSES_FILE, 'w') as f:
        json.dump(responses, f, indent=2)


@app.route('/api/question', methods=['GET'])
def get_random_question():
    """API endpoint to get a random question based on domain and user ID."""
    domain = request.args.get('domain', '')
    user_id = request.args.get('user_id', 'anonymous')
    
    if not domain:
        return jsonify({'error': 'Domain parameter is required'}), 400
    
    # Load questions for the domain
    questions = load_domain_questions(domain)
    if not questions:
        return jsonify({'error': f'No questions found for domain: {domain}'}), 404
    
    # Load reviewed questions for this user
    reviewed = load_reviewed_questions().get(user_id, [])
    
    # Filter out already reviewed questions
    available_questions = [q for q in questions if q['id'] not in reviewed]
    
    if not available_questions:
        return jsonify({'message': 'All questions have been reviewed'}), 204
    
    # Select a random question
    selected_question = random.choice(available_questions)
    
    # Select a random answer for this question
    if 'answers' in selected_question and selected_question['answers']:
        selected_answer = random.choice(selected_question['answers'])
        return jsonify({
            'question': selected_question,
            'selected_answer': selected_answer
        })
    else:
        return jsonify({'error': 'No answers found for the selected question'}), 500


@app.route('/api/response', methods=['POST'])
def submit_response():
    """API endpoint to submit a response."""
    data = request.json
    
    # Validate required fields
    required_fields = ['user_id', 'domain', 'questionId', 'answerId', 'ratings']
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
    
    # Save the response
    save_response(data)
    
    # Mark the question as reviewed for this user
    save_reviewed_question(data['user_id'], data['questionId'])
    
    return jsonify({'success': True})


@app.route('/api/export', methods=['GET'])
def export_data():
    """API endpoint to export all response data."""
    try:
        with open(RESPONSES_FILE, 'r') as f:
            responses = json.load(f)
        return jsonify(responses)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        return jsonify({'error': f'Error exporting data: {str(e)}'}), 500


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """API endpoint to get annotation statistics."""
    try:
        with open(RESPONSES_FILE, 'r') as f:
            responses = json.load(f)
        
        # Calculate basic statistics
        stats = {
            'total_responses': len(responses),
            'domains': {},
            'criteria_averages': {
                'reasoning': 0,
                'accuracy': 0,
                'domainKnowledge': 0,
                'creativity': 0,
                'difficulty': 0
            }
        }
        
        # Count responses by domain
        for response in responses:
            domain = response.get('domain', 'unknown')
            if domain not in stats['domains']:
                stats['domains'][domain] = 0
            stats['domains'][domain] += 1
            
            # Sum ratings for averaging
            if 'ratings' in response:
                for criterion, value in response['ratings'].items():
                    if criterion in stats['criteria_averages']:
                        stats['criteria_averages'][criterion] += value
        
        # Calculate averages
        for criterion in stats['criteria_averages']:
            if stats['total_responses'] > 0:
                stats['criteria_averages'][criterion] = round(
                    stats['criteria_averages'][criterion] / stats['total_responses'], 2
                )
        
        return jsonify(stats)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        return jsonify({'error': f'Error fetching stats: {str(e)}'}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)