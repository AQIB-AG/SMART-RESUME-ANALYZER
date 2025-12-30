from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os

db = SQLAlchemy()
migrate = Migrate()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    role = db.Column(db.Enum('candidate', 'recruiter', 'admin', name='user_roles'), nullable=False, default='candidate')
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    resumes = db.relationship('Resume', backref='user', lazy=True, cascade='all, delete-orphan')
    posted_jobs = db.relationship('Job', backref='recruiter', lazy=True, cascade='all, delete-orphan')
    applications = db.relationship('Application', backref='candidate', lazy=True)
    
    def __repr__(self):
        return f'<User {self.email} - {self.role}>'


class Resume(db.Model):
    __tablename__ = 'resumes'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_size = db.Column(db.Integer)  # in bytes
    upload_date = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    # Resume content fields
    raw_text = db.Column(db.Text)  # Full text extracted from resume
    extracted_skills = db.Column(db.JSON)  # JSON array of skills
    extracted_education = db.Column(db.JSON)  # JSON array of education entries
    extracted_experience = db.Column(db.JSON)  # JSON array of experience entries
    extracted_contact = db.Column(db.JSON)  # JSON object with contact info
    
    # Analysis results
    ats_score = db.Column(db.Float)  # 0-100
    keyword_density = db.Column(db.JSON)  # JSON object with keyword scores
    sections_analysis = db.Column(db.JSON)  # Analysis of resume sections
    
    # Status
    status = db.Column(db.Enum('uploaded', 'processing', 'completed', 'failed', name='resume_status'), default='uploaded')
    
    def __repr__(self):
        return f'<Resume {self.filename} - User: {self.user_id}>'


class Job(db.Model):
    __tablename__ = 'jobs'
    
    id = db.Column(db.Integer, primary_key=True)
    recruiter_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    requirements = db.Column(db.JSON)  # JSON array of requirements
    skills_required = db.Column(db.JSON)  # JSON array of required skills
    experience_level = db.Column(db.Enum('entry', 'mid', 'senior', 'executive', name='experience_levels'))
    job_type = db.Column(db.Enum('fulltime', 'parttime', 'contract', 'internship', 'remote', name='job_types'))
    location = db.Column(db.String(200))
    salary_min = db.Column(db.Integer)  # in USD
    salary_max = db.Column(db.Integer)  # in USD
    posted_date = db.Column(db.DateTime, default=db.func.current_timestamp())
    deadline = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    applications = db.relationship('Application', backref='job', lazy=True)
    
    def __repr__(self):
        return f'<Job {self.title} - Recruiter: {self.recruiter_id}>'


class Skill(db.Model):
    __tablename__ = 'skills'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    category = db.Column(db.String(50))  # e.g., 'technical', 'soft', 'domain'
    frequency = db.Column(db.Integer, default=0)  # How often this skill appears in job descriptions
    difficulty_level = db.Column(db.Enum('beginner', 'intermediate', 'advanced', name='skill_difficulty'))
    
    def __repr__(self):
        return f'<Skill {self.name} - Category: {self.category}>'


class Application(db.Model):
    __tablename__ = 'applications'
    
    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    resume_id = db.Column(db.Integer, db.ForeignKey('resumes.id'), nullable=False)
    applied_date = db.Column(db.DateTime, default=db.func.current_timestamp())
    status = db.Column(db.Enum('applied', 'reviewed', 'interview', 'rejected', 'hired', name='application_status'), default='applied')
    match_score = db.Column(db.Float)  # Calculated match score between candidate and job
    
    # Ensure unique applications
    __table_args__ = (db.UniqueConstraint('candidate_id', 'job_id', name='unique_candidate_job_application'),)
    
    def __repr__(self):
        return f'<Application - Candidate: {self.candidate_id}, Job: {self.job_id}>'


class ResumeJobMatch(db.Model):
    __tablename__ = 'resume_job_matches'
    
    id = db.Column(db.Integer, primary_key=True)
    resume_id = db.Column(db.Integer, db.ForeignKey('resumes.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    match_score = db.Column(db.Float, nullable=False)  # 0-100 percentage
    skills_match = db.Column(db.JSON)  # JSON object with matched/missing skills
    keyword_match = db.Column(db.Float)  # Keyword matching score
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    # Ensure unique resume-job pairs
    __table_args__ = (db.UniqueConstraint('resume_id', 'job_id', name='unique_resume_job_match'),)
    
    def __repr__(self):
        return f'<Match - Resume: {self.resume_id}, Job: {self.job_id}, Score: {self.match_score}>'


class SkillGapAnalysis(db.Model):
    __tablename__ = 'skill_gap_analysis'
    
    id = db.Column(db.Integer, primary_key=True)
    resume_id = db.Column(db.Integer, db.ForeignKey('resumes.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    missing_skills = db.Column(db.JSON)  # JSON array of missing skills
    recommended_learning_paths = db.Column(db.JSON)  # JSON array of learning recommendations
    career_suggestions = db.Column(db.JSON)  # JSON array of career suggestions
    analysis_date = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    def __repr__(self):
        return f'<SkillGapAnalysis - Resume: {self.resume_id}, Job: {self.job_id}>'


class SystemConfig(db.Model):
    __tablename__ = 'system_config'
    
    id = db.Column(db.Integer, primary_key=True)
    config_key = db.Column(db.String(100), unique=True, nullable=False)
    config_value = db.Column(db.Text)
    description = db.Column(db.String(500))
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    
    def __repr__(self):
        return f'<Config {self.config_key}>'