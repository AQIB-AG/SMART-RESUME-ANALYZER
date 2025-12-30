from .database import db
from datetime import datetime


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