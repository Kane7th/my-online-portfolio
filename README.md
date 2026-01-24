# Kane Kabena - Portfolio 🚀

Welcome to my portfolio! This site showcases some of my skills, projects, and experience in software development.

## 🌟 Website Features
- Interactive dark-themed design with atmospheric background
- Custom **FiveM server development** experience
- **Python Flask** backend with RESTful API
- **HTML, CSS, JavaScript** frontend
- Smooth animations and smooth UI
- Interactive lamp element
- Responsive design

## 🛠 Technologies Used

### Backend
- **Flask** - Python web framework
- **Flask-CORS** - Cross-origin resource sharing
- **Python-dotenv** - Environment variable management

### Frontend
- **HTML5** & **CSS3** for structure and styling
- **JavaScript** for interactivity
- **Google Fonts (Inter)** for typography

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd my-online-portfolio
   ```

2. **Create a virtual environment** (recommended)
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**
   
   On Windows:
   ```bash
   venv\Scripts\activate
   ```
   
   On macOS/Linux:
   ```bash
   source venv/bin/activate
   ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the configuration:
   ```
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   PORT=5000
   ```

### Running the Application

1. **Start the Flask backend**
   ```bash
   python app.py
   ```

2. **Open your browser**
   Navigate to `http://localhost:5000`

The application will be running on port 5000 by default (or the port specified in your `.env` file).

## 📁 Project Structure

```
my-online-portfolio/
├── app.py                 # Flask application entry point
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore file
├── templates/           # HTML templates
│   └── index.html      # Main portfolio page
└── static/             # Static files
    ├── css/
    │   └── style.css   # Stylesheet
    ├── js/
    │   └── script.js   # JavaScript
    ├── images/         # Image assets
    └── Kane - 2025 Resume.pdf
```

## 🔌 API Endpoints

### Health Check
- `GET /api/health` - Check if the API is running

### Projects
- `GET /api/projects` - Get list of projects

### Skills
- `GET /api/skills` - Get list of skills

### Contact
- `POST /api/contact` - Submit contact form
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hello!"
  }
  ```

## 🎨 Features

- **Dark Theme**: Atmospheric dark blue/gray color scheme
- **Interactive Elements**: Clickable lamp with glow effect
- **Smooth Scrolling**: Navigation with smooth scroll behavior
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Animated Background**: Mountain landscape with birds and tree
- **HTML Tag Styling**: Decorative HTML tags in hero section

## 📝 Development

### Adding New Features

1. **Backend Routes**: Add new routes in `app.py`
2. **Frontend**: Update templates in `templates/` and static files in `static/`
3. **Styling**: Modify `static/css/style.css`
4. **JavaScript**: Update `static/js/script.js`

### Environment Variables

- `SECRET_KEY`: Flask secret key for sessions (change in production!)
- `DEBUG`: Enable/disable debug mode (set to `False` in production)
- `PORT`: Port number for the Flask server (default: 5000)

## 🌍 Deployment

### Production Checklist
- [ ] Set `DEBUG=False` in `.env`
- [ ] Change `SECRET_KEY` to a secure random string
- [ ] Use a production WSGI server (e.g., Gunicorn)
- [ ] Set up proper error logging
- [ ] Configure CORS for your domain
- [ ] Set up SSL/HTTPS

### Example with Gunicorn
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 📧 Contact

- **Email**: onekaneldn@gmail.com
- **Phone**: +44 7565 470 169
- **GitHub**: [Kane7th](https://github.com/Kane7th)
- **LinkedIn**: [kanekabena](https://www.linkedin.com/in/kanekabena/)

## 📄 License

© 2025 Kane Kabena. All rights reserved.
