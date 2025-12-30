from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import pandas as pd
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import json
from collections import Counter


class JobMatcher:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            max_features=5000,
            ngram_range=(1, 2),
            lowercase=True,
            strip_accents='unicode'
        )
        
        # Initialize NLTK resources
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt')
        
        try:
            nltk.data.find('corpora/stopwords')
        except LookupError:
            nltk.download('stopwords')
        
        try:
            nltk.data.find('corpora/wordnet')
        except LookupError:
            nltk.download('wordnet')
        
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
    
    def preprocess_text(self, text):
        """Preprocess text for better matching"""
        if not text:
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters and digits
        text = re.sub(r'[^a-zA-Z\s]', ' ', text)
        
        # Tokenize
        tokens = word_tokenize(text)
        
        # Remove stopwords and lemmatize
        tokens = [self.lemmatizer.lemmatize(token) for token in tokens 
                 if token not in self.stop_words and len(token) > 2]
        
        return ' '.join(tokens)
    
    def calculate_tfidf_similarity(self, resume_text, job_description):
        """Calculate similarity using TF-IDF and cosine similarity"""
        # Preprocess both texts
        processed_resume = self.preprocess_text(resume_text)
        processed_job = self.preprocess_text(job_description)
        
        if not processed_resume or not processed_job:
            return 0.0
        
        # Fit and transform the texts
        try:
            tfidf_matrix = self.vectorizer.fit_transform([processed_resume, processed_job])
            
            # Calculate cosine similarity
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
            
            return float(similarity[0][0])
        except:
            # Fallback to a simple keyword matching approach
            return self.calculate_keyword_similarity(processed_resume, processed_job)
    
    def calculate_keyword_similarity(self, resume_text, job_description):
        """Calculate similarity based on keyword matching"""
        resume_words = set(resume_text.split())
        job_words = set(job_description.split())
        
        if not resume_words or not job_words:
            return 0.0
        
        # Calculate intersection
        common_words = resume_words.intersection(job_words)
        
        # Jaccard similarity
        jaccard_similarity = len(common_words) / len(resume_words.union(job_words))
        
        return jaccard_similarity
    
    def calculate_skills_similarity(self, resume_skills, job_skills):
        """Calculate similarity based on skill matching"""
        if not resume_skills or not job_skills:
            return 0.0
        
        # Convert to sets for easier comparison
        if isinstance(resume_skills, str):
            resume_skills = set(resume_skills.lower().split(','))
        elif isinstance(resume_skills, list):
            resume_skills = set([skill.lower().strip() for skill in resume_skills])
        else:
            resume_skills = set()
        
        if isinstance(job_skills, str):
            job_skills = set(job_skills.lower().split(','))
        elif isinstance(job_skills, list):
            job_skills = set([skill.lower().strip() for skill in job_skills])
        else:
            job_skills = set()
        
        if not resume_skills or not job_skills:
            return 0.0
        
        # Calculate intersection
        matched_skills = resume_skills.intersection(job_skills)
        
        # Return ratio of matched skills to required skills
        if len(job_skills) == 0:
            return 0.0
        
        return len(matched_skills) / len(job_skills)
    
    def calculate_experience_similarity(self, resume_experience, job_experience):
        """Calculate similarity based on experience requirements"""
        if not job_experience or job_experience == 0:
            return 1.0  # No experience requirement
        
        if not resume_experience:
            return 0.0
        
        # If resume experience meets or exceeds job requirement
        if resume_experience >= job_experience:
            return 1.0
        else:
            # Calculate partial match
            return resume_experience / job_experience
    
    def calculate_education_similarity(self, resume_education, job_education):
        """Calculate similarity based on education requirements"""
        if not job_education:
            return 1.0  # No education requirement
        
        if not resume_education:
            return 0.0
        
        # Simple string matching for education
        resume_edu_lower = str(resume_education).lower()
        job_edu_lower = str(job_education).lower()
        
        # Check if required education is in resume
        if job_edu_lower in resume_edu_lower:
            return 1.0
        elif 'bachelor' in job_edu_lower and 'bachelor' in resume_edu_lower:
            return 0.8
        elif 'master' in job_edu_lower and 'master' in resume_edu_lower:
            return 1.0
        elif 'phd' in job_edu_lower and 'phd' in resume_edu_lower:
            return 1.0
        elif 'master' in job_edu_lower and 'bachelor' in resume_edu_lower:
            return 0.6
        else:
            return 0.3
    
    def match_resume_to_job(self, resume_data, job_data, weights=None):
        """Match a resume to a job position with different similarity metrics"""
        if weights is None:
            # Default weights for different components
            weights = {
                'text_similarity': 0.4,  # TF-IDF based text similarity
                'skills_similarity': 0.3,  # Skills matching
                'experience_similarity': 0.2,  # Experience matching
                'education_similarity': 0.1   # Education matching
            }
        
        # Calculate individual similarities
        text_sim = self.calculate_tfidf_similarity(
            resume_data.get('raw_text', ''), 
            job_data.get('description', '')
        )
        
        skills_sim = self.calculate_skills_similarity(
            resume_data.get('extracted_skills', []), 
            job_data.get('skills_required', [])
        )
        
        experience_sim = self.calculate_experience_similarity(
            resume_data.get('total_experience_years', 0),
            job_data.get('min_experience_years', 0)
        )
        
        education_sim = self.calculate_education_similarity(
            resume_data.get('education', ''),
            job_data.get('education_required', '')
        )
        
        # Calculate weighted similarity score
        total_similarity = (
            text_sim * weights['text_similarity'] +
            skills_sim * weights['skills_similarity'] +
            experience_sim * weights['experience_similarity'] +
            education_sim * weights['education_similarity']
        )
        
        # Convert to percentage
        match_percentage = min(100, max(0, total_similarity * 100))
        
        return {
            'match_percentage': round(match_percentage, 2),
            'detailed_scores': {
                'text_similarity': round(text_sim * 100, 2),
                'skills_similarity': round(skills_sim * 100, 2),
                'experience_similarity': round(experience_sim * 100, 2),
                'education_similarity': round(education_sim * 100, 2)
            },
            'weights_used': weights,
            'matched_skills': self.get_matched_skills(
                resume_data.get('extracted_skills', []),
                job_data.get('skills_required', [])
            ),
            'missing_skills': self.get_missing_skills(
                resume_data.get('extracted_skills', []),
                job_data.get('skills_required', [])
            )
        }
    
    def get_matched_skills(self, resume_skills, job_skills):
        """Get skills that match between resume and job requirements"""
        if isinstance(resume_skills, str):
            resume_skills = [skill.strip() for skill in resume_skills.split(',')]
        if isinstance(job_skills, str):
            job_skills = [skill.strip() for skill in job_skills.split(',')]
        
        resume_set = set([skill.lower().strip() for skill in resume_skills])
        job_set = set([skill.lower().strip() for skill in job_skills])
        
        return list(resume_set.intersection(job_set))
    
    def get_missing_skills(self, resume_skills, job_skills):
        """Get skills required by job but missing in resume"""
        if isinstance(resume_skills, str):
            resume_skills = [skill.strip() for skill in resume_skills.split(',')]
        if isinstance(job_skills, str):
            job_skills = [skill.strip() for skill in job_skills.split(',')]
        
        resume_set = set([skill.lower().strip() for skill in resume_skills])
        job_set = set([skill.lower().strip() for skill in job_skills])
        
        return list(job_set.difference(resume_set))
    
    def rank_jobs(self, resume_data, jobs_list, top_n=None):
        """Rank a list of jobs based on match with resume"""
        job_matches = []
        
        for job in jobs_list:
            match_result = self.match_resume_to_job(resume_data, job)
            job_matches.append({
                'job_id': job.get('id'),
                'job_title': job.get('title'),
                'company': job.get('company', 'Unknown'),
                'match_percentage': match_result['match_percentage'],
                'details': match_result
            })
        
        # Sort by match percentage in descending order
        ranked_jobs = sorted(job_matches, key=lambda x: x['match_percentage'], reverse=True)
        
        # Return top N if specified
        if top_n:
            ranked_jobs = ranked_jobs[:top_n]
        
        return ranked_jobs
    
    def batch_match(self, resumes_data, jobs_data):
        """Match multiple resumes to multiple jobs"""
        results = []
        
        for resume in resumes_data:
            resume_results = {
                'resume_id': resume.get('id'),
                'matched_jobs': self.rank_jobs(resume, jobs_data)
            }
            results.append(resume_results)
        
        return results


# Example usage
if __name__ == "__main__":
    matcher = JobMatcher()
    
    # Example resume data
    resume_data = {
        'raw_text': 'Software Engineer with 5 years of experience in Python, JavaScript, and React. Experience with AWS, Docker, and Kubernetes. Strong problem-solving and communication skills.',
        'extracted_skills': ['python', 'javascript', 'react', 'aws', 'docker', 'kubernetes', 'problem solving', 'communication'],
        'total_experience_years': 5,
        'education': 'Bachelor of Science in Computer Science'
    }
    
    # Example job data
    job_data = {
        'description': 'We are looking for a Senior Software Engineer with experience in Python, JavaScript, and cloud technologies like AWS. Experience with Docker and Kubernetes is required.',
        'skills_required': ['python', 'javascript', 'aws', 'docker', 'kubernetes'],
        'min_experience_years': 3,
        'education_required': 'Bachelor degree'
    }
    
    # Calculate match
    result = matcher.match_resume_to_job(resume_data, job_data)
    print("Match Result:", json.dumps(result, indent=2))