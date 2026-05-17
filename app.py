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
    """Main portfolio page - serves root index.html for GitHub Pages compatibility"""
    import os
    from flask import send_from_directory
    root_dir = os.path.dirname(os.path.abspath(__file__))
    return send_from_directory(root_dir, 'index.html')

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
            'message': 'Message received. I will reply soon.'
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
            'title': 'MySmartRental 2.0',
            'description': 'Flagship property management SaaS. React, TypeScript, Flask, PostgreSQL, M-Pesa, native mobile apps. Staging live.',
            'link': 'https://staging.mysmartrental.com/',
            'type': 'site'
        },
        {
            'id': 2,
            'title': 'Uptwn Ldn Clothing Website',
            'description': 'React + Vite e-commerce site with Node/Express API, cart, checkout, and nginx on Ubuntu.',
            'link': 'http://72.61.146.2/',
            'type': 'site'
        },
        {
            'id': 3,
            'title': 'Seven Scripts (Tebex)',
            'description': 'Tebex store for FiveM and RedM Lua scripts. Custom theme, Discord support, Tebex checkout.',
            'link': 'https://sevenscripts.tebex.io/',
            'type': 'store'
        },
        {
            'id': 4,
            'title': 'SokoCredit',
            'description': 'Loan management app for microfinance lenders. M-Pesa, Twilio SMS, RBAC, Flask API, React frontend.',
            'link': 'https://github.com/Kane7th/Phase-5-Project-SokoCredit',
            'type': 'code'
        },
        {
            'id': 5,
            'title': 'Hotel Booking System',
            'description': 'React + Flask app with JWT auth, admin and customer areas, search, filters, and toast notifications.',
            'link': 'https://youtu.be/WrYNyjDwBYI',
            'type': 'demo'
        },
        {
            'id': 6,
            'title': 'Zone 7 RP',
            'description': 'FiveM roleplay server. Lua scripts, economy tuning, MySQL player data, jobs and admin tools.',
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
    return app.send_static_file('Kane Kabena CV - Mar 2026.pdf')

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
