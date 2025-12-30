from .database import db
from datetime import datetime


class Skill(db.Model):
    __tablename__ = 'skills'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    category = db.Column(db.String(50))  # e.g., 'technical', 'soft', 'domain'
    frequency = db.Column(db.Integer, default=0)  # How often this skill appears in job descriptions
    difficulty_level = db.Column(db.Enum('beginner', 'intermediate', 'advanced', name='skill_difficulty'))
    
    def __repr__(self):
        return f'<Skill {self.name} - Category: {self.category}>'