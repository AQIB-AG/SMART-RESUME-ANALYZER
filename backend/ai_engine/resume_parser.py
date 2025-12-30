import PyPDF2
import docx
import os
import re
from io import BytesIO
from docx import Document
import pdfplumber


class ResumeParser:
    def __init__(self):
        pass
    
    def extract_text_from_pdf(self, file_path):
        """Extract text from PDF file"""
        try:
            text = ""
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() or ""
            return text
        except Exception as e:
            print(f"Error extracting text from PDF: {str(e)}")
            return ""
    
    def extract_text_from_docx(self, file_path):
        """Extract text from DOCX file"""
        try:
            doc = Document(file_path)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs if paragraph.text])
            return text
        except Exception as e:
            print(f"Error extracting text from DOCX: {str(e)}")
            return ""
    
    def extract_text_from_doc(self, file_path):
        """Extract text from DOC file using antiword (requires antiword to be installed on the system)"""
        try:
            import subprocess
            result = subprocess.run(['antiword', file_path], capture_output=True, text=True)
            return result.stdout
        except Exception as e:
            print(f"Error extracting text from DOC: {str(e)}")
            # Fallback: try using docx library after conversion
            try:
                # Convert doc to docx and then extract
                import win32com.client as win32
                word = win32com.client.Dispatch("Word.Application")
                doc = word.Documents.Open(file_path)
                doc.SaveAs(file_path + "x", FileFormat=16)  # 16 represents docx format
                doc.Close()
                word.Quit()
                
                # Now extract from the converted docx
                text = self.extract_text_from_docx(file_path + "x")
                
                # Remove the temporary file
                os.remove(file_path + "x")
                
                return text
            except:
                return ""
    
    def parse_resume(self, file_path):
        """Parse resume file and extract all relevant information"""
        # Determine file type
        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension == '.pdf':
            text = self.extract_text_from_pdf(file_path)
        elif file_extension == '.docx':
            text = self.extract_text_from_docx(file_path)
        elif file_extension == '.doc':
            text = self.extract_text_from_doc(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_extension}")
        
        # Clean the text
        cleaned_text = self.clean_text(text)
        
        # Extract different sections
        sections = self.extract_sections(cleaned_text)
        
        # Extract contact information
        contact_info = self.extract_contact_info(cleaned_text)
        
        # Extract education
        education = self.extract_education(cleaned_text)
        
        # Extract work experience
        experience = self.extract_experience(cleaned_text)
        
        return {
            'raw_text': text,
            'cleaned_text': cleaned_text,
            'sections': sections,
            'contact_info': contact_info,
            'education': education,
            'experience': experience
        }
    
    def clean_text(self, text):
        """Clean the extracted text"""
        # Remove extra whitespaces
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep essential ones
        text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
        
        return text.strip()
    
    def extract_sections(self, text):
        """Extract different sections from the resume"""
        sections = {}
        
        # Common section headers
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
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                sections[section_name] = match.group(2).strip()
        
        return sections
    
    def extract_contact_info(self, text):
        """Extract contact information from the resume"""
        contact_info = {}
        
        # Email pattern
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        if emails:
            contact_info['email'] = emails[0]
        
        # Phone number pattern
        phone_pattern = r'(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}'
        phones = re.findall(phone_pattern, text)
        if phones:
            contact_info['phone'] = phones[0]
        
        # Address patterns (simplified)
        address_pattern = r'\d+\s+\w+\s+\w+\s*(?:\w+\s*)*,\s*\w+\s+\d{5}'
        addresses = re.findall(address_pattern, text)
        if addresses:
            contact_info['address'] = addresses[0]
        
        # LinkedIn URL
        linkedin_pattern = r'linkedin\.com\/in\/[^\s\/]+|linkedin\.com\/pub\/[^\s\/]+|linkedin\.com\/in\/[^\s]+|linkedin\.com\/pub\/[^\s]+'
        linkedin_urls = re.findall(linkedin_pattern, text, re.IGNORECASE)
        if linkedin_urls:
            contact_info['linkedin'] = linkedin_urls[0]
        
        return contact_info
    
    def extract_education(self, text):
        """Extract education information from the resume"""
        education = []
        
        # Common degree patterns
        degree_patterns = [
            r'((?:Bachelor|Master|Doctor|PhD|B\.?[A-Z]*|M\.?[A-Z]*|B\.Sc|M\.Sc|B\.Tech|M\.Tech|B\.A|M\.A)[^\n]+?)\n',
            r'((?:Bachelors?|Masters?|Doctorate|PhD)[^\n]+?)(?:\n|\b(?:skills|experience|summary)\b)',
        ]
        
        for pattern in degree_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE | re.DOTALL)
            for match in matches:
                # Extract degree, field, institution, and year
                edu_entry = self.parse_education_entry(match.strip())
                if edu_entry:
                    education.append(edu_entry)
        
        return education
    
    def parse_education_entry(self, text):
        """Parse a single education entry"""
        entry = {}
        
        # Institution
        institution_pattern = r'(University|College|Institute|School)[\w\s,.-]*'
        institution_match = re.search(institution_pattern, text, re.IGNORECASE)
        if institution_match:
            entry['institution'] = institution_match.group(0).strip()
        
        # Degree
        degree_pattern = r'(?:Bachelor|Master|Doctor|PhD|B\.?[A-Z]*|M\.?[A-Z]*|B\.Sc|M\.Sc|B\.Tech|M\.Tech|B\.A|M\.A|Bachelors?|Masters?|Doctorate)[\w\s&-]*'
        degree_match = re.search(degree_pattern, text, re.IGNORECASE)
        if degree_match:
            entry['degree'] = degree_match.group(0).strip()
        
        # Year/Date
        year_pattern = r'(?:\d{4}|\d{2})[\s/-]?(?:present|\d{4}|\d{2})?'
        year_match = re.search(year_pattern, text)
        if year_match:
            entry['year'] = year_match.group(0).strip()
        
        return entry if entry else None
    
    def extract_experience(self, text):
        """Extract work experience from the resume"""
        experiences = []
        
        # Common patterns for work experience
        # This is a simplified approach - in a real application, you'd want more sophisticated parsing
        experience_pattern = r'([\w\s]+)\s*(?:-|at|@)\s*([\w\s,.-]+)\s*(?:\(|,|\n)?\s*([\w\s/-]+)?'
        matches = re.findall(experience_pattern, text, re.IGNORECASE)
        
        for match in matches:
            exp_entry = {
                'job_title': match[0].strip(),
                'company': match[1].strip(),
                'duration': match[2].strip() if match[2] else None
            }
            experiences.append(exp_entry)
        
        return experiences


# Example usage
if __name__ == "__main__":
    parser = ResumeParser()
    # Example: parser.parse_resume("path/to/resume.pdf")