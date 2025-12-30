from flask import Blueprint, request, jsonify, session
from models.resume import Resume
from models.job import Job
from models.database import db
from routes.auth import login_required, role_required
from ai_engine.resume_parser import ResumeParser
from ai_engine.skill_extractor import SkillExtractor
from ai_engine.job_matcher import JobMatcher
from ai_engine.skill_gap_analyzer import SkillGapAnalyzer
from ai_engine.utils import calculate_ats_score, analyze_resume_sections
import os

analysis_bp = Blueprint('analysis', __name__)


@analysis_bp.route('/analyze-resume/<int:resume_id>', methods=['GET'])
@login_required
def analyze_resume(resume_id):
    try:
        # Get resume from database
        resume = Resume.query.get(resume_id)
        
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404
        
        # Check if user has permission to access this resume
        user_id = session['user_id']
        user_role = session['user_role']
        
        if user_role != 'admin' and resume.user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Initialize AI components
        parser = ResumeParser()
        extractor = SkillExtractor()
        matcher = JobMatcher()
        gap_analyzer = SkillGapAnalyzer()
        
        # Parse the resume
        parsed_data = parser.parse_resume(resume.file_path)
        
        # Extract skills
        skills_data = extractor.extract_skills(parsed_data['raw_text'])
        
        # Calculate ATS score
        ats_score = calculate_ats_score(parsed_data['raw_text'])
        
        # Analyze resume sections
        sections_analysis = analyze_resume_sections(parsed_data['raw_text'])
        
        # Update resume record with analysis results
        resume.raw_text = parsed_data['raw_text']
        resume.extracted_skills = skills_data['all_skills']
        resume.extracted_education = parsed_data['education']
        resume.extracted_experience = parsed_data['experience']
        resume.extracted_contact = parsed_data['contact_info']
        resume.ats_score = ats_score
        resume.sections_analysis = sections_analysis
        
        # Set status to completed
        resume.status = 'completed'
        
        db.session.commit()
        
        return jsonify({
            'message': 'Resume analyzed successfully',
            'resume_id': resume.id,
            'ats_score': ats_score,
            'skills': skills_data,
            'sections_analysis': sections_analysis,
            'contact_info': parsed_data['contact_info'],
            'education': parsed_data['education'],
            'experience': parsed_data['experience']
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@analysis_bp.route('/match-resume-to-jobs/<int:resume_id>', methods=['GET'])
@login_required
def match_resume_to_jobs(resume_id):
    try:
        # Get resume from database
        resume = Resume.query.get(resume_id)
        
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404
        
        # Check if user has permission to access this resume
        user_id = session['user_id']
        user_role = session['user_role']
        
        if user_role != 'admin' and resume.user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Get all active jobs
        jobs = Job.query.filter_by(is_active=True).all()
        
        # Initialize job matcher
        matcher = JobMatcher()
        
        # Prepare resume data for matching
        resume_data = {
            'raw_text': resume.raw_text,
            'extracted_skills': resume.extracted_skills or [],
            'total_experience_years': len(resume.extracted_experience) if resume.extracted_experience else 0,
            'education': resume.extracted_education
        }
        
        # Match resume to all jobs
        job_matches = []
        for job in jobs:
            job_data = {
                'id': job.id,
                'title': job.title,
                'description': job.description,
                'skills_required': job.skills_required or [],
                'min_experience_years': 2,  # Default value, in a real app this would come from the job
                'education_required': 'Bachelor'  # Default value
            }
            
            match_result = matcher.match_resume_to_job(resume_data, job_data)
            
            job_matches.append({
                'job_id': job.id,
                'job_title': job.title,
                'company': job.recruiter.first_name + ' ' + job.recruiter.last_name if job.recruiter else 'Unknown',
                'match_percentage': match_result['match_percentage'],
                'matched_skills': match_result['matched_skills'],
                'missing_skills': match_result['missing_skills']
            })
        
        # Sort by match percentage
        job_matches.sort(key=lambda x: x['match_percentage'], reverse=True)
        
        return jsonify({
            'resume_id': resume.id,
            'job_matches': job_matches[:10]  # Return top 10 matches
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@analysis_bp.route('/skill-gap-analysis/<int:resume_id>/<int:job_id>', methods=['GET'])
@login_required
def skill_gap_analysis(resume_id, job_id):
    try:
        # Get resume and job from database
        resume = Resume.query.get(resume_id)
        job = Job.query.get(job_id)
        
        if not resume or not job:
            return jsonify({'error': 'Resume or job not found'}), 404
        
        # Check if user has permission to access this resume
        user_id = session['user_id']
        user_role = session['user_role']
        
        if user_role != 'admin' and resume.user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Initialize skill gap analyzer
        gap_analyzer = SkillGapAnalyzer()
        
        # Perform skill gap analysis
        gap_analysis = gap_analyzer.analyze_skill_gaps(
            resume.extracted_skills or [],
            job.skills_required or []
        )
        
        # Generate improvement plan
        improvement_plan = gap_analyzer.generate_improvement_plan(gap_analysis)
        
        # Compare with market trends
        market_comparison = gap_analyzer.compare_with_market_trends(resume.extracted_skills or [])
        
        return jsonify({
            'resume_id': resume.id,
            'job_id': job.id,
            'gap_analysis': gap_analysis,
            'improvement_plan': improvement_plan,
            'market_comparison': market_comparison
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@analysis_bp.route('/get-analysis-summary/<int:resume_id>', methods=['GET'])
@login_required
def get_analysis_summary(resume_id):
    try:
        # Get resume from database
        resume = Resume.query.get(resume_id)
        
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404
        
        # Check if user has permission to access this resume
        user_id = session['user_id']
        user_role = session['user_role']
        
        if user_role != 'admin' and resume.user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        return jsonify({
            'resume_id': resume.id,
            'filename': resume.filename,
            'ats_score': resume.ats_score,
            'skills_count': len(resume.extracted_skills) if resume.extracted_skills else 0,
            'status': resume.status,
            'upload_date': resume.upload_date.isoformat() if resume.upload_date else None,
            'extracted_skills': resume.extracted_skills,
            'education': resume.extracted_education,
            'experience': resume.extracted_experience,
            'contact_info': resume.extracted_contact,
            'sections_analysis': resume.sections_analysis
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500