from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os
import uuid
from werkzeug.utils import secure_filename

# Initialize Flask app with custom template and static folders
app = Flask(
    __name__,
    template_folder='../frontend/templates',
    static_folder='../frontend/static'
)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///resume_analyzer.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB max file size

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Import models after db initialization to avoid circular imports
from models.user import User
from models.resume import Resume
from models.job import Job
from models.skill import Skill

# Import routes
from routes.auth import auth_bp
from routes.user import user_bp
from routes.resume import resume_bp
from routes.job import job_bp
from routes.analysis import analysis_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(user_bp, url_prefix='/api/users')
app.register_blueprint(resume_bp, url_prefix='/api/resumes')
app.register_blueprint(job_bp, url_prefix='/api/jobs')
app.register_blueprint(analysis_bp, url_prefix='/api/analysis')

# Create upload directories
os.makedirs(os.path.join(app.root_path, 'uploads', 'resumes'), exist_ok=True)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/login')
def login_page():
    return render_template('login.html')


@app.route('/register')
def register_page():
    return render_template('register.html')


@app.route('/upload')
def upload_page():
    if 'user_id' not in session:
        return redirect(url_for('login_page'))
    return render_template('upload.html')


@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login_page'))
    return render_template('dashboard.html')



@app.route('/jobs')
def jobs_page():
    if 'user_id' not in session:
        return redirect(url_for('login_page'))
    return render_template('jobs.html')


@app.route('/skillgap')
def skillgap_page():
    if 'user_id' not in session:
        return redirect(url_for('login_page'))
    return render_template('skillgap.html')


@app.route('/job-post')
def job_post_page():
    if 'user_id' not in session:
        return redirect(url_for('login_page'))
    user = User.query.get(session['user_id'])
    if user.role not in ['recruiter', 'admin']:
        return redirect(url_for('dashboard'))
    return render_template('job_post.html')


@app.route('/recruiter-dashboard')
def recruiter_dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login_page'))
    user = User.query.get(session['user_id'])
    if user.role not in ['recruiter', 'admin']:
        return redirect(url_for('dashboard'))
    return render_template('recruiter_dashboard.html')


@app.route('/admin-dashboard')
def admin_dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login_page'))
    user = User.query.get(session['user_id'])
    if user.role != 'admin':
        return redirect(url_for('dashboard'))
    return render_template('admin_dashboard.html')


# API route to get user info
@app.route('/api/user/info')
def get_user_info():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'id': user.id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'role': user.role
    })


# Error handlers
@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404


@app.errorhandler(500)
def internal_error(error):
    return render_template('500.html'), 500


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)