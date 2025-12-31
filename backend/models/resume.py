from .database import db
from datetime import datetime


class Resume(db.Model):
    __tablename__ = 'resumes'
    __table_args__ = {'extend_existing': True}
    
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