import spacy
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.tag import pos_tag
from collections import Counter
import json
import os


class SkillExtractor:
    def __init__(self):
        self.nlp = None
        self.technical_skills = self.load_technical_skills()
        self.soft_skills = self.load_soft_skills()
        self.industry_keywords = self.load_industry_keywords()
        
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
            nltk.data.find('taggers/averaged_perceptron_tagger')
        except LookupError:
            nltk.download('averaged_perceptron_tagger')
        
        # Load spaCy model if available, otherwise use NLTK
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("spaCy model not found. Using NLTK for NLP processing.")
            self.nlp = None
    
    def load_technical_skills(self):
        """Load a comprehensive list of technical skills"""
        technical_skills = {
            # Programming Languages
            'python', 'java', 'javascript', 'typescript', 'c', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
            'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'dart', 'objective-c', 'sql', 'noql',
            
            # Web Development
            'html', 'css', 'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'laravel',
            'spring', 'spring boot', 'asp.net', 'jquery', 'ajax', 'json', 'xml', 'rest', 'graphql', 'web api',
            
            # Databases
            'mysql', 'postgresql', 'mongodb', 'oracle', 'sql server', 'redis', 'elasticsearch', 'cassandra',
            'couchbase', 'firebase', 'dynamodb', 'sqlite',
            
            # DevOps & Cloud
            'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'gitlab', 'travis', 'circleci',
            'terraform', 'ansible', 'puppet', 'chef', 'vagrant', 'bash', 'powershell', 'linux', 'unix',
            'ci/cd', 'github actions', 'cloud formation', 'ec2', 's3', 'lambda', 'vpc',
            
            # Frameworks & Libraries
            'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'keras', 'nltk', 'spacy', 'opencv',
            'matplotlib', 'seaborn', 'plotly', 'd3.js', 'three.js', 'bootstrap', 'materialize', 'tailwind',
            
            # Tools & Technologies
            'git', 'svn', 'jira', 'confluence', 'slack', 'trello', 'asana', 'figma', 'sketch', 'adobe',
            'photoshop', 'illustrator', 'indesign', 'tableau', 'power bi', 'excel', 'sas', 'r', 'hadoop',
            'spark', 'hive', 'pig', 'kafka', 'airflow', 'snowflake', 'redshift',
            
            # Certifications
            'aws certified', 'azure certified', 'gcp certified', 'scrum master', 'pmp', 'six sigma',
            'ccna', 'ccnp', 'ccie', 'comptia', 'security+', 'cissp', 'itil', 'prince2',
        }
        return technical_skills
    
    def load_soft_skills(self):
        """Load a list of soft skills"""
        soft_skills = {
            'communication', 'leadership', 'teamwork', 'problem solving', 'adaptability',
            'creativity', 'work ethic', 'interpersonal skills', 'time management',
            'critical thinking', 'negotiation', 'empathy', 'patience', 'flexibility',
            'conflict resolution', 'decision making', 'organizational skills',
            'attention to detail', 'stress management', 'cultural awareness',
            'emotional intelligence', 'collaboration', 'active listening', 'persuasion',
            'public speaking', 'networking', 'mentoring', 'delegation',
        }
        return soft_skills
    
    def load_industry_keywords(self):
        """Load industry-specific keywords"""
        industry_keywords = {
            # General industry terms
            'agile', 'scrum', 'kanban', 'sprint', 'backlog', 'user story', 'sdlc', 'devops',
            'tdd', 'bdd', 'microservices', 'monolith', 'api', 'sdk', 'restful', 'oauth',
            'jwt', 'soap', 'xml', 'json', 'yaml', 'docker', 'container', 'orchestration',
            'monitoring', 'logging', 'observability', 'incident response', 'on-call',
            
            # Business terms
            'stakeholder', 'roi', 'kpi', 'dashboard', 'analytics', 'crm', 'erp', 'mvp',
            'product roadmap', 'requirements gathering', 'user experience', 'user interface',
            'product development', 'market analysis', 'competitive analysis', 'go-to-market',
        }
        return industry_keywords
    
    def extract_skills_spacy(self, text):
        """Extract skills using spaCy if available"""
        if not self.nlp:
            return self.extract_skills_nltk(text)
        
        doc = self.nlp(text.lower())
        
        # Extract tokens and entities
        tokens = [token.text for token in doc if not token.is_stop and not token.is_punct]
        
        found_skills = []
        
        # Check for single-word skills
        for token in tokens:
            if token in self.technical_skills or token in self.soft_skills:
                found_skills.append(token)
        
        # Check for multi-word skills (phrases)
        text_lower = text.lower()
        for skill in self.technical_skills.union(self.soft_skills):
            if len(skill.split()) > 1 and skill in text_lower:
                found_skills.append(skill)
        
        return list(set(found_skills))
    
    def extract_skills_nltk(self, text):
        """Extract skills using NLTK"""
        # Tokenize the text
        tokens = word_tokenize(text.lower())
        
        # Get part-of-speech tags
        pos_tags = pos_tag(tokens)
        
        # Extract skills based on keywords
        found_skills = []
        
        # Check for single-word skills
        for token in tokens:
            if token in self.technical_skills or token in self.soft_skills:
                found_skills.append(token)
        
        # Check for multi-word skills (phrases)
        text_lower = text.lower()
        for skill in self.technical_skills.union(self.soft_skills):
            if len(skill.split()) > 1 and skill in text_lower:
                found_skills.append(skill)
        
        # Use regex patterns to find potential skills
        potential_skills = self.find_potential_skills_regex(text_lower)
        found_skills.extend(potential_skills)
        
        return list(set(found_skills))
    
    def find_potential_skills_regex(self, text):
        """Find potential skills using regex patterns"""
        potential_skills = []
        
        # Pattern for technologies with dots (e.g., C#, .NET, etc.)
        tech_pattern = r'(?:c\+\+|c#|\.net|asp\.net|sql server|node\.js|react\.js|angular\.js|vue\.js|\w+\.\w+|\w+js)'
        tech_matches = re.findall(tech_pattern, text, re.IGNORECASE)
        
        for match in tech_matches:
            if match.lower() in self.technical_skills:
                potential_skills.append(match.lower())
        
        # Pattern for version numbers and technologies (e.g., Python 3, Java 8)
        version_pattern = r'(\w+)\s+(\d+(?:\.\d+)?)'
        version_matches = re.findall(version_pattern, text, re.IGNORECASE)
        
        for tech, version in version_matches:
            tech_version = f"{tech} {version}"
            if tech.lower() in self.technical_skills or tech_version.lower() in self.technical_skills:
                potential_skills.append(tech.lower())
        
        return potential_skills
    
    def extract_skills(self, text):
        """Main method to extract skills from text"""
        if not text:
            return []
        
        # Use spaCy if available, otherwise use NLTK
        if self.nlp:
            skills = self.extract_skills_spacy(text)
        else:
            skills = self.extract_skills_nltk(text)
        
        # Categorize skills
        categorized_skills = self.categorize_skills(skills)
        
        return {
            'all_skills': skills,
            'technical_skills': categorized_skills['technical'],
            'soft_skills': categorized_skills['soft'],
            'count': len(skills)
        }
    
    def categorize_skills(self, skills):
        """Categorize skills into technical and soft skills"""
        technical = []
        soft = []
        
        for skill in skills:
            if skill.lower() in self.technical_skills:
                technical.append(skill.lower())
            elif skill.lower() in self.soft_skills:
                soft.append(skill.lower())
        
        return {
            'technical': list(set(technical)),
            'soft': list(set(soft))
        }
    
    def extract_keywords_with_frequency(self, text, top_n=50):
        """Extract keywords with their frequency from the text"""
        # Use NLTK for keyword extraction
        tokens = word_tokenize(text.lower())
        
        # Remove stopwords
        stop_words = set(stopwords.words('english'))
        tokens = [word for word in tokens if word.isalpha() and word not in stop_words]
        
        # Count word frequencies
        word_freq = Counter(tokens)
        
        # Get top N keywords
        top_keywords = dict(word_freq.most_common(top_n))
        
        return top_keywords
    
    def match_skills_to_job(self, resume_skills, job_requirements):
        """Match resume skills to job requirements"""
        if isinstance(job_requirements, str):
            job_requirements = job_requirements.lower().split()
        elif isinstance(job_requirements, list):
            job_requirements = [req.lower() for req in job_requirements]
        else:
            job_requirements = []
        
        matched_skills = []
        missing_skills = []
        
        for skill in resume_skills['all_skills']:
            if skill.lower() in job_requirements:
                matched_skills.append(skill)
            else:
                missing_skills.append(skill)
        
        required_but_missing = []
        for req in job_requirements:
            if req not in [s.lower() for s in resume_skills['all_skills']]:
                required_but_missing.append(req)
        
        return {
            'matched_skills': matched_skills,
            'missing_skills': missing_skills,
            'required_but_missing': required_but_missing,
            'match_percentage': len(matched_skills) / len(job_requirements) * 100 if job_requirements else 0
        }


# Example usage
if __name__ == "__main__":
    extractor = SkillExtractor()
    
    # Example resume text
    resume_text = """
    Software Engineer with 5 years of experience in Python, JavaScript, and React. 
    Experience with AWS, Docker, and Kubernetes. Strong problem-solving and communication skills.
    """
    
    skills = extractor.extract_skills(resume_text)
    print("Extracted Skills:", skills)