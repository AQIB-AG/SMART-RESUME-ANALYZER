from flask import Blueprint, request, jsonify, current_app, session
from models.resume import Resume
from models.user import User
from models.database import db
from routes.auth import login_required, role_required
import os
from werkzeug.utils import secure_filename
import uuid

resume_bp = Blueprint('resume', __name__)


ALLOWED_EXTENSIONS = {'.pdf', '.doc', '.docx'}


def allowed_file(filename):
    return os.path.splitext(filename)[1].lower() in ALLOWED_EXTENSIONS


@resume_bp.route('/', methods=['POST'])
@login_required
def upload_resume():
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'No resume file provided'}), 400
        
        file = request.files['resume']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Only PDF, DOC, and DOCX files are allowed'}), 400
        
        # Create upload directory if it doesn't exist
        upload_dir = os.path.join(current_app.root_path, 'uploads', 'resumes')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        file.save(file_path)
        
        # Create resume record in database
        resume = Resume(
            user_id=session['user_id'],  # Only allow user to upload for themselves
            filename=unique_filename,
            file_path=file_path,
            original_filename=filename,
            file_size=os.path.getsize(file_path),
            status='uploaded'
        )
        
        db.session.add(resume)
        db.session.commit()
        
        return jsonify({
            'message': 'Resume uploaded successfully',
            'resume_id': resume.id,
            'filename': resume.filename,
            'status': resume.status
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@resume_bp.route('/', methods=['GET'])
@login_required
def get_resumes():
    try:
        user_id = session['user_id']
        user_role = session['user_role']
        
        # Admin can view all resumes, others can only view their own
        if user_role == 'admin':
            user_id_filter = request.args.get('user_id')
            if user_id_filter:
                resumes = Resume.query.filter_by(user_id=user_id_filter).all()
            else:
                resumes = Resume.query.all()
        else:
            resumes = Resume.query.filter_by(user_id=user_id).all()
        
        return jsonify({
            'resumes': [{
                'id': resume.id,
                'filename': resume.filename,
                'original_filename': resume.original_filename,
                'file_size': resume.file_size,
                'upload_date': resume.upload_date.isoformat() if resume.upload_date else None,
                'status': resume.status,
                'ats_score': resume.ats_score,
                'user_id': resume.user_id
            } for resume in resumes]
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@resume_bp.route('/<int:resume_id>', methods=['GET'])
@login_required
def get_resume(resume_id):
    try:
        resume = Resume.query.get(resume_id)
        
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404
        
        # Check if user has permission to access this resume
        user_id = session['user_id']
        user_role = session['user_role']
        
        if user_role != 'admin' and resume.user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        return jsonify({
            'resume': {
                'id': resume.id,
                'filename': resume.filename,
                'original_filename': resume.original_filename,
                'file_path': resume.file_path,
                'file_size': resume.file_size,
                'upload_date': resume.upload_date.isoformat() if resume.upload_date else None,
                'raw_text': resume.raw_text,
                'extracted_skills': resume.extracted_skills,
                'extracted_education': resume.extracted_education,
                'extracted_experience': resume.extracted_experience,
                'extracted_contact': resume.extracted_contact,
                'ats_score': resume.ats_score,
                'keyword_density': resume.keyword_density,
                'sections_analysis': resume.sections_analysis,
                'status': resume.status,
                'user_id': resume.user_id
            }
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@resume_bp.route('/<int:resume_id>', methods=['PUT'])
@login_required
def update_resume(resume_id):
    try:
        resume = Resume.query.get(resume_id)
        
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404
        
        # Only admin or the owner can update the resume
        user_id = session['user_id']
        user_role = session['user_role']
        
        if user_role != 'admin' and resume.user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        
        # Update allowed fields
        if 'status' in data:
            resume.status = data['status']
        if 'ats_score' in data:
            resume.ats_score = data['ats_score']
        if 'raw_text' in data:
            resume.raw_text = data['raw_text']
        if 'extracted_skills' in data:
            resume.extracted_skills = data['extracted_skills']
        if 'keyword_density' in data:
            resume.keyword_density = data['keyword_density']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Resume updated successfully',
            'resume_id': resume.id
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@resume_bp.route('/<int:resume_id>', methods=['DELETE'])
@login_required
def delete_resume(resume_id):
    try:
        resume = Resume.query.get(resume_id)
        
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404
        
        # Only admin or the owner can delete the resume
        user_id = session['user_id']
        user_role = session['user_role']
        
        if user_role != 'admin' and resume.user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Delete the file from the filesystem
        if os.path.exists(resume.file_path):
            os.remove(resume.file_path)
        
        db.session.delete(resume)
        db.session.commit()
        
        return jsonify({'message': 'Resume deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500