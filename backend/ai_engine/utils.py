import re
import os
import json
from datetime import datetime
from werkzeug.utils import secure_filename


def validate_file_type(filename):
    """Validate if the file type is allowed"""
    ALLOWED_EXTENSIONS = {'.pdf', '.doc', '.docx'}
    return os.path.splitext(filename)[1].lower() in ALLOWED_EXTENSIONS


def validate_file_size(file_path, max_size_mb=5):
    """Validate if the file size is within limits"""
    max_size_bytes = max_size_mb * 1024 * 1024
    file_size = os.path.getsize(file_path)
    return file_size <= max_size_bytes, file_size


def generate_unique_filename(original_filename):
    """Generate a unique filename to prevent conflicts"""
    import uuid
    name, ext = os.path.splitext(secure_filename(original_filename))
    unique_name = f"{uuid.uuid4()}_{name}{ext}"
    return unique_name


def calculate_ats_score(text, required_keywords=None):
    """Calculate a basic ATS score based on keyword presence and resume structure"""
    if not text:
        return 0
    
    # Default keywords if none provided
    if required_keywords is None:
        required_keywords = [
            'experience', 'education', 'skills', 'summary', 'objective',
            'work', 'projects', 'certifications', 'awards', 'contact'
        ]
    
    # Calculate keyword presence score (0-50)
    text_lower = text.lower()
    keywords_found = 0
    for keyword in required_keywords:
        if keyword.lower() in text_lower:
            keywords_found += 1
    
    keyword_score = min(50, (keywords_found / len(required_keywords)) * 50)
    
    # Calculate content score (0-30) based on length and structure
    word_count = len(text.split())
    if word_count < 100:
        content_score = 0
    elif word_count < 300:
        content_score = 10
    elif word_count < 600:
        content_score = 20
    else:
        content_score = 30
    
    # Calculate format score (0-20) based on structure indicators
    format_score = 0
    structure_indicators = [
        r'\d{4}',  # years
        r'\b[A-Z][a-z]+\s+[A-Z][a-z]+\b',  # proper names
        r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b',  # months
        r'\b(?:Bachelor|Master|PhD|B\.?[A-Z]*|M\.?[A-Z]*)\b',  # degrees
        r'\b(?:Inc|LLC|Corp|Company|Ltd)\b'  # company indicators
    ]
    
    for indicator in structure_indicators:
        if re.search(indicator, text):
            format_score += 3
    
    format_score = min(20, format_score)
    
    # Total score
    total_score = keyword_score + content_score + format_score
    
    # Ensure score is within 0-100 range
    return min(100, max(0, round(total_score)))


def analyze_resume_sections(text):
    """Analyze different sections of the resume"""
    sections = {}
    
    # Define section patterns
    section_patterns = {
        'summary': r'(summary|objective|profile):?\s*([^\n]+(?:\n(?![A-Z])[^\n]+)*)',
        'experience': r'(experience|work experience|employment history):?\s*([^\n]+(?:\n(?![A-Z])[^\n]+)*)',
        'education': r'(education|academic background):?\s*([^\n]+(?:\n(?![A-Z])[^\n]+)*)',
        'skills': r'(skills|technical skills|core competencies):?\s*([^\n]+(?:\n(?![A-Z])[^\n]+)*)',
        'certifications': r'(certifications|certificates):?\s*([^\n]+(?:\n(?![A-Z])[^\n]+)*)',
        'projects': r'(projects|project experience):?\s*([^\n]+(?:\n(?![A-Z])[^\n]+)*)',
        'awards': r'(awards|honors):?\s*([^\n]+(?:\n(?![A-Z])[^\n]+)*)',
    }
    
    for section_name, pattern in section_patterns.items():
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE | re.DOTALL)
        if match:
            sections[section_name] = {
                'found': True,
                'content': match.group(2).strip(),
                'length': len(match.group(2).strip())
            }
        else:
            sections[section_name] = {
                'found': False,
                'content': '',
                'length': 0
            }
    
    return sections


def extract_keywords(text, top_n=20):
    """Extract top keywords from text"""
    import nltk
    from nltk.corpus import stopwords
    from nltk.tokenize import word_tokenize
    from collections import Counter
    
    try:
        # Download required NLTK data if not already present
        nltk.download('punkt', quiet=True)
        nltk.download('stopwords', quiet=True)
        
        # Tokenize the text
        tokens = word_tokenize(text.lower())
        
        # Remove stopwords and non-alphabetic tokens
        stop_words = set(stopwords.words('english'))
        tokens = [word for word in tokens if word.isalpha() and word not in stop_words and len(word) > 2]
        
        # Count word frequencies
        word_freq = Counter(tokens)
        
        # Get top N keywords
        top_keywords = [word for word, freq in word_freq.most_common(top_n)]
        
        return top_keywords
    except:
        # Fallback if NLTK is not available
        # Simple keyword extraction using regex
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        word_freq = Counter(words)
        top_keywords = [word for word, freq in word_freq.most_common(top_n)]
        return top_keywords


def save_analysis_results(resume_id, analysis_results, output_dir="analysis_results"):
    """Save analysis results to a JSON file"""
    os.makedirs(output_dir, exist_ok=True)
    filename = f"analysis_{resume_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    filepath = os.path.join(output_dir, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(analysis_results, f, indent=2, ensure_ascii=False, default=str)
    
    return filepath


def load_analysis_results(filepath):
    """Load analysis results from a JSON file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def format_phone_number(phone_str):
    """Format phone number to a standard format"""
    # Remove all non-digits
    digits = re.sub(r'\D', '', phone_str)
    
    if len(digits) == 10:
        # US format
        return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
    elif len(digits) == 11 and digits[0] == '1':
        # US format with country code
        return f"+1 ({digits[1:4]}) {digits[4:7]}-{digits[7:]}"
    else:
        return phone_str


def sanitize_text(text):
    """Sanitize text by removing potentially harmful characters"""
    # Remove null bytes and other control characters
    sanitized = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
    return sanitized.strip()