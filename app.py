from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for API endpoints

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['DEBUG'] = os.getenv('DEBUG', 'False').lower() == 'true'

# Routes
@app.route('/')
def index():
    """Main portfolio page"""
    # Serve the root index.html for GitHub Pages compatibility
    import os
    root_dir = os.path.dirname(os.path.abspath(__file__))
    index_path = os.path.join(root_dir, 'index.html')
    with open(index_path, 'r', encoding='utf-8') as f:
        content = f.read()
    # Replace static paths with Flask url_for for local development
    content = content.replace('href="style.css"', 'href="{{ url_for(\'static\', filename=\'css/style.css\') }}"')
    content = content.replace('src="script.js"', 'src="{{ url_for(\'static\', filename=\'js/script.js\') }}"')
    content = content.replace('href="Kane - 2025 Resume.pdf"', 'href="{{ url_for(\'download_resume\') }}"')
    from flask import render_template_string
    return render_template_string(content)

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Portfolio API is running'
    }), 200

@app.route('/api/contact', methods=['POST'])
def contact():
    """Handle contact form submissions"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'message']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'error': f'{field} is required'
                }), 400
        
        # Here you can add email sending logic, database storage, etc.
        # For now, we'll just return success
        print(f"Contact form submission:")
        print(f"Name: {data.get('name')}")
        print(f"Email: {data.get('email')}")
        print(f"Message: {data.get('message')}")
        
        return jsonify({
            'success': True,
            'message': 'Thank you for your message! I will get back to you soon.'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/projects')
def get_projects():
    """Get projects data"""
    projects = [
        {
            'id': 1,
            'title': 'SokoCredit',
            'description': 'Full-stack loan management system for microfinance lenders with M-Pesa & Twilio integrations. Features role-based access, analytics, and real-time notifications.',
            'link': 'https://github.com/Kane7th/Phase-5-Project-SokoCredit',
            'type': 'code'
        },
        {
            'id': 2,
            'title': 'Hotel Booking System',
            'description': 'React + Flask web app with JWT authentication, admin & customer portals, and a polished UI with pagination, filters, and toast notifications.',
            'link': 'https://youtu.be/WrYNyjDwBYI',
            'type': 'demo'
        },
        {
            'id': 3,
            'title': 'Zone 7 RP',
            'description': 'Custom FiveM roleplay server with advanced player systems, economy balancing, and immersive scripts for enhanced gameplay.',
            'link': '#',
            'type': 'server'
        }
    ]
    return jsonify(projects), 200

@app.route('/api/skills')
def get_skills():
    """Get skills data"""
    skills = [
        'Flask (Python)',
        'React & Redux Toolkit',
        'PostgreSQL & SQLAlchemy',
        'JWT Authentication',
        'RESTful API Development',
        'HTML5, CSS3, JavaScript',
        'Tailwind CSS',
        'Git & GitHub',
        'FiveM Server Development'
    ]
    return jsonify(skills), 200

@app.route('/resume')
def download_resume():
    """Serve resume PDF"""
    return app.send_static_file('Kane - 2025 Resume.pdf')

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
