from flask import Blueprint, request, jsonify, session
from models.job import Job
from models.user import User
from models.database import db
from routes.auth import login_required, role_required

job_bp = Blueprint('job', __name__)


@job_bp.route('/', methods=['POST'])
@role_required(['recruiter', 'admin'])
def create_job():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'description', 'skills_required']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        job = Job(
            recruiter_id=session['user_id'],
            title=data['title'],
            description=data['description'],
            requirements=data.get('requirements', []),
            skills_required=data['skills_required'],
            experience_level=data.get('experience_level'),
            job_type=data.get('job_type'),
            location=data.get('location'),
            salary_min=data.get('salary_min'),
            salary_max=data.get('salary_max'),
            deadline=data.get('deadline')
        )
        
        db.session.add(job)
        db.session.commit()
        
        return jsonify({
            'message': 'Job created successfully',
            'job_id': job.id
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@job_bp.route('/', methods=['GET'])
@login_required
def get_jobs():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Filters
        title_filter = request.args.get('title')
        location_filter = request.args.get('location')
        job_type_filter = request.args.get('job_type')
        experience_level_filter = request.args.get('experience_level')
        
        query = Job.query.filter_by(is_active=True)
        
        if title_filter:
            query = query.filter(Job.title.contains(title_filter))
        if location_filter:
            query = query.filter(Job.location.contains(location_filter))
        if job_type_filter:
            query = query.filter_by(job_type=job_type_filter)
        if experience_level_filter:
            query = query.filter_by(experience_level=experience_level_filter)
        
        jobs = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'jobs': [{
                'id': job.id,
                'title': job.title,
                'description': job.description,
                'requirements': job.requirements,
                'skills_required': job.skills_required,
                'experience_level': job.experience_level,
                'job_type': job.job_type,
                'location': job.location,
                'salary_min': job.salary_min,
                'salary_max': job.salary_max,
                'posted_date': job.posted_date.isoformat() if job.posted_date else None,
                'deadline': job.deadline.isoformat() if job.deadline else None,
                'is_active': job.is_active,
                'recruiter_id': job.recruiter_id,
                'recruiter_name': f"{job.recruiter.first_name} {job.recruiter.last_name}" if job.recruiter else None
            } for job in jobs.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': jobs.total,
                'pages': jobs.pages
            }
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@job_bp.route('/<int:job_id>', methods=['GET'])
@login_required
def get_job(job_id):
    try:
        job = Job.query.get(job_id)
        
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        if not job.is_active:
            return jsonify({'error': 'Job is no longer active'}), 404
        
        return jsonify({
            'job': {
                'id': job.id,
                'title': job.title,
                'description': job.description,
                'requirements': job.requirements,
                'skills_required': job.skills_required,
                'experience_level': job.experience_level,
                'job_type': job.job_type,
                'location': job.location,
                'salary_min': job.salary_min,
                'salary_max': job.salary_max,
                'posted_date': job.posted_date.isoformat() if job.posted_date else None,
                'deadline': job.deadline.isoformat() if job.deadline else None,
                'is_active': job.is_active,
                'recruiter_id': job.recruiter_id,
                'recruiter_name': f"{job.recruiter.first_name} {job.recruiter.last_name}" if job.recruiter else None
            }
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@job_bp.route('/<int:job_id>', methods=['PUT'])
@role_required(['recruiter', 'admin'])
def update_job(job_id):
    try:
        job = Job.query.get(job_id)
        
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        # Check if user has permission to update this job
        user_id = session['user_id']
        user_role = session['user_role']
        
        if user_role != 'admin' and job.recruiter_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        
        # Update allowed fields
        if 'title' in data:
            job.title = data['title']
        if 'description' in data:
            job.description = data['description']
        if 'requirements' in data:
            job.requirements = data['requirements']
        if 'skills_required' in data:
            job.skills_required = data['skills_required']
        if 'experience_level' in data:
            job.experience_level = data['experience_level']
        if 'job_type' in data:
            job.job_type = data['job_type']
        if 'location' in data:
            job.location = data['location']
        if 'salary_min' in data:
            job.salary_min = data['salary_min']
        if 'salary_max' in data:
            job.salary_max = data['salary_max']
        if 'deadline' in data:
            job.deadline = data['deadline']
        if 'is_active' in data:
            job.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Job updated successfully',
            'job_id': job.id
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@job_bp.route('/<int:job_id>', methods=['DELETE'])
@role_required(['recruiter', 'admin'])
def delete_job(job_id):
    try:
        job = Job.query.get(job_id)
        
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        # Check if user has permission to delete this job
        user_id = session['user_id']
        user_role = session['user_role']
        
        if user_role != 'admin' and job.recruiter_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        db.session.delete(job)
        db.session.commit()
        
        return jsonify({'message': 'Job deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@job_bp.route('/my-jobs', methods=['GET'])
@role_required(['recruiter', 'admin'])
def get_my_jobs():
    try:
        user_id = session['user_id']
        user_role = session['user_role']
        
        if user_role == 'admin':
            # Admin can see all jobs they posted or all jobs if no filter
            jobs = Job.query.filter_by(recruiter_id=user_id).all()
        else:
            jobs = Job.query.filter_by(recruiter_id=user_id).all()
        
        return jsonify({
            'jobs': [{
                'id': job.id,
                'title': job.title,
                'description': job.description,
                'requirements': job.requirements,
                'skills_required': job.skills_required,
                'experience_level': job.experience_level,
                'job_type': job.job_type,
                'location': job.location,
                'salary_min': job.salary_min,
                'salary_max': job.salary_max,
                'posted_date': job.posted_date.isoformat() if job.posted_date else None,
                'deadline': job.deadline.isoformat() if job.deadline else None,
                'is_active': job.is_active
            } for job in jobs]
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500