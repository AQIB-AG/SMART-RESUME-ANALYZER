import json
from collections import Counter, defaultdict
import random


class SkillGapAnalyzer:
    def __init__(self):
        self.skill_categories = self.load_skill_categories()
        self.learning_resources = self.load_learning_resources()
        self.career_paths = self.load_career_paths()
    
    def load_skill_categories(self):
        """Load skill categories and their relationships"""
        return {
            'technical': {
                'programming': ['python', 'java', 'javascript', 'c++', 'go', 'rust'],
                'web_dev': ['html', 'css', 'react', 'angular', 'vue', 'node.js'],
                'data_science': ['python', 'r', 'sql', 'pandas', 'numpy', 'machine learning'],
                'cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes'],
                'databases': ['mysql', 'postgresql', 'mongodb', 'redis'],
                'devops': ['jenkins', 'git', 'ci/cd', 'linux', 'bash']
            },
            'soft': {
                'communication': ['written communication', 'verbal communication', 'presentation skills'],
                'leadership': ['team management', 'decision making', 'delegation'],
                'problem_solving': ['critical thinking', 'analytical skills', 'creativity'],
                'adaptability': ['flexibility', 'learning agility', 'resilience']
            }
        }
    
    def load_learning_resources(self):
        """Load learning resources for different skills"""
        return {
            'python': [
                {'title': 'Python for Data Science', 'platform': 'Coursera', 'url': 'https://coursera.org/python-ds', 'duration': '4 weeks', 'difficulty': 'beginner'},
                {'title': 'Python Programming Bootcamp', 'platform': 'Udemy', 'url': 'https://udemy.com/python-bootcamp', 'duration': '6 weeks', 'difficulty': 'beginner'},
                {'title': 'Automate the Boring Stuff with Python', 'platform': 'Book', 'url': 'https://automatetheboringstuff.com', 'duration': '8 weeks', 'difficulty': 'beginner'}
            ],
            'javascript': [
                {'title': 'JavaScript: Understanding the Weird Parts', 'platform': 'Udemy', 'url': 'https://udemy.com/js-weird-parts', 'duration': '6 weeks', 'difficulty': 'intermediate'},
                {'title': 'The Complete JavaScript Course', 'platform': 'Udemy', 'url': 'https://udemy.com/js-complete', 'duration': '8 weeks', 'difficulty': 'beginner'},
                {'title': 'Eloquent JavaScript', 'platform': 'Book', 'url': 'https://eloquentjavascript.net', 'duration': '10 weeks', 'difficulty': 'intermediate'}
            ],
            'react': [
                {'title': 'React - The Complete Guide', 'platform': 'Udemy', 'url': 'https://udemy.com/react-complete', 'duration': '6 weeks', 'difficulty': 'intermediate'},
                {'title': 'Full Stack Open', 'platform': 'University', 'url': 'https://fullstackopen.com', 'duration': '12 weeks', 'difficulty': 'intermediate'},
                {'title': 'React Official Tutorial', 'platform': 'Documentation', 'url': 'https://reactjs.org/tutorial', 'duration': '2 weeks', 'difficulty': 'beginner'}
            ],
            'aws': [
                {'title': 'AWS Certified Solutions Architect', 'platform': 'A Cloud Guru', 'url': 'https://acloudguru.com/aws-sa', 'duration': '8 weeks', 'difficulty': 'intermediate'},
                {'title': 'AWS Fundamentals', 'platform': 'Coursera', 'url': 'https://coursera.org/aws-fundamentals', 'duration': '4 weeks', 'difficulty': 'beginner'},
                {'title': 'AWS Certified Developer', 'platform': 'Udemy', 'url': 'https://udemy.com/aws-developer', 'duration': '6 weeks', 'difficulty': 'intermediate'}
            ],
            'machine learning': [
                {'title': 'Machine Learning by Andrew Ng', 'platform': 'Coursera', 'url': 'https://coursera.org/ml', 'duration': '10 weeks', 'difficulty': 'intermediate'},
                {'title': 'Python for Machine Learning', 'platform': 'Udemy', 'url': 'https://udemy.com/python-ml', 'duration': '8 weeks', 'difficulty': 'intermediate'},
                {'title': 'Hands-On Machine Learning', 'platform': 'Book', 'url': 'https://oreilly.com/hands-on-ml', 'duration': '12 weeks', 'difficulty': 'intermediate'}
            ],
            'communication': [
                {'title': 'Communication Skills for Engineers', 'platform': 'Coursera', 'url': 'https://coursera.org/comm-skills-eng', 'duration': '4 weeks', 'difficulty': 'beginner'},
                {'title': 'Technical Writing', 'platform': 'Udemy', 'url': 'https://udemy.com/tech-writing', 'duration': '3 weeks', 'difficulty': 'beginner'},
                {'title': 'Public Speaking', 'platform': 'Toastmasters', 'url': 'https://toastmasters.org', 'duration': 'ongoing', 'difficulty': 'beginner'}
            ],
            'leadership': [
                {'title': 'Leadership Principles', 'platform': 'Harvard Online', 'url': 'https://online.hbs.edu/leadership', 'duration': '6 weeks', 'difficulty': 'advanced'},
                {'title': 'Management Fundamentals', 'platform': 'Coursera', 'url': 'https://coursera.org/management', 'duration': '5 weeks', 'difficulty': 'intermediate'},
                {'title': 'The First 90 Days', 'platform': 'Book', 'url': 'https://hbr.org/first-90-days', 'duration': '2 weeks', 'difficulty': 'intermediate'}
            ]
        }
    
    def load_career_paths(self):
        """Load career paths and required skills"""
        return {
            'software_engineer': {
                'title': 'Software Engineer',
                'required_skills': ['programming', 'problem solving', 'algorithms', 'data structures', 'version control', 'testing'],
                'preferred_skills': ['python', 'javascript', 'java', 'sql', 'git', 'agile'],
                'career_level': 'entry_to_mid',
                'salary_range': {'min': 70000, 'max': 120000}
            },
            'data_scientist': {
                'title': 'Data Scientist',
                'required_skills': ['python', 'r', 'statistics', 'machine learning', 'data visualization', 'sql'],
                'preferred_skills': ['pandas', 'numpy', 'scikit-learn', 'tensorflow', 'matplotlib', 'jupyter'],
                'career_level': 'mid_to_senior',
                'salary_range': {'min': 90000, 'max': 150000}
            },
            'devops_engineer': {
                'title': 'DevOps Engineer',
                'required_skills': ['linux', 'bash', 'docker', 'kubernetes', 'ci/cd', 'cloud platforms'],
                'preferred_skills': ['aws', 'azure', 'jenkins', 'gitlab', 'terraform', 'ansible'],
                'career_level': 'mid_to_senior',
                'salary_range': {'min': 95000, 'max': 160000}
            },
            'full_stack_developer': {
                'title': 'Full Stack Developer',
                'required_skills': ['javascript', 'html', 'css', 'databases', 'api development', 'version control'],
                'preferred_skills': ['react', 'node.js', 'express', 'mongodb', 'postgresql', 'rest'],
                'career_level': 'entry_to_mid',
                'salary_range': {'min': 75000, 'max': 130000}
            },
            'cloud_engineer': {
                'title': 'Cloud Engineer',
                'required_skills': ['cloud platforms', 'infrastructure as code', 'networking', 'security', 'virtualization'],
                'preferred_skills': ['aws', 'azure', 'gcp', 'terraform', 'docker', 'kubernetes'],
                'career_level': 'mid_to_senior',
                'salary_range': {'min': 85000, 'max': 140000}
            }
        }
    
    def analyze_skill_gaps(self, resume_skills, job_requirements, current_role=None):
        """Analyze skill gaps between resume and job requirements"""
        if isinstance(resume_skills, str):
            resume_skills = [skill.strip().lower() for skill in resume_skills.split(',')]
        elif isinstance(resume_skills, list):
            resume_skills = [skill.lower().strip() for skill in resume_skills]
        else:
            resume_skills = []
        
        if isinstance(job_requirements, str):
            job_requirements = [req.strip().lower() for req in job_requirements.split(',')]
        elif isinstance(job_requirements, list):
            job_requirements = [req.lower().strip() for req in job_requirements]
        else:
            job_requirements = []
        
        # Find missing skills
        missing_skills = []
        for req in job_requirements:
            if req not in resume_skills:
                missing_skills.append(req)
        
        # Find existing skills
        existing_skills = [skill for skill in resume_skills if skill in job_requirements]
        
        # Calculate gap percentage
        total_required = len(job_requirements)
        total_missing = len(missing_skills)
        gap_percentage = (total_missing / total_required * 100) if total_required > 0 else 0
        
        # Categorize missing skills
        categorized_gaps = self.categorize_skills(missing_skills)
        
        # Get learning recommendations
        learning_recommendations = self.get_learning_recommendations(missing_skills)
        
        # Get career suggestions
        career_suggestions = self.get_career_suggestions(resume_skills, current_role)
        
        return {
            'missing_skills': missing_skills,
            'existing_skills': existing_skills,
            'total_required_skills': total_required,
            'total_missing_skills': total_missing,
            'gap_percentage': round(gap_percentage, 2),
            'categorized_gaps': categorized_gaps,
            'learning_recommendations': learning_recommendations,
            'career_suggestions': career_suggestions,
            'priority_skills': self.get_priority_skills(missing_skills, job_requirements)
        }
    
    def categorize_skills(self, skills):
        """Categorize skills into different domains"""
        categorized = defaultdict(list)
        
        for skill in skills:
            categorized['other'].append(skill)
        
        # This is a simplified categorization - in a real system, this would be more sophisticated
        technical_keywords = ['python', 'java', 'javascript', 'sql', 'react', 'angular', 'node', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'c++', 'c#', 'php', 'ruby', 'go', 'rust']
        soft_keywords = ['communication', 'leadership', 'teamwork', 'problem solving', 'adaptability', 'creativity', 'work ethic', 'time management']
        
        for skill in skills:
            if skill in technical_keywords:
                categorized['technical'].append(skill)
            elif skill in soft_keywords:
                categorized['soft'].append(skill)
            else:
                categorized['other'].append(skill)
        
        return dict(categorized)
    
    def get_learning_recommendations(self, missing_skills):
        """Get learning recommendations for missing skills"""
        recommendations = []
        
        for skill in missing_skills:
            skill_lower = skill.lower()
            
            if skill_lower in self.learning_resources:
                # Get a random recommendation for the skill
                skill_recommendations = self.learning_resources[skill_lower]
                if skill_recommendations:
                    # Add top 2 recommendations
                    for rec in skill_recommendations[:2]:
                        recommendations.append({
                            'skill': skill,
                            'title': rec['title'],
                            'platform': rec['platform'],
                            'url': rec['url'],
                            'duration': rec['duration'],
                            'difficulty': rec['difficulty']
                        })
            else:
                # Generic recommendation if specific resource not found
                recommendations.append({
                    'skill': skill,
                    'title': f'Learn {skill.title()}',
                    'platform': 'Multiple Platforms',
                    'url': f'https://www.google.com/search?q=learn+{skill}',
                    'duration': 'Variable',
                    'difficulty': 'Variable'
                })
        
        return recommendations
    
    def get_career_suggestions(self, resume_skills, current_role=None):
        """Get career path suggestions based on current skills"""
        suggestions = []
        
        # Calculate match for each career path
        for career_id, career_info in self.career_paths.items():
            required_match = 0
            preferred_match = 0
            
            # Count matches with required skills
            for req_skill in career_info['required_skills']:
                if req_skill in resume_skills:
                    required_match += 1
            
            # Count matches with preferred skills
            for pref_skill in career_info['preferred_skills']:
                if pref_skill in resume_skills:
                    preferred_match += 1
            
            # Calculate match percentage
            total_required = len(career_info['required_skills'])
            total_preferred = len(career_info['preferred_skills'])
            
            required_percentage = (required_match / total_required * 100) if total_required > 0 else 0
            preferred_percentage = (preferred_match / total_preferred * 100) if total_preferred > 0 else 0
            
            # Overall match
            overall_match = (required_percentage * 0.7 + preferred_percentage * 0.3)  # Weighted average
            
            suggestions.append({
                'career_path': career_info['title'],
                'match_percentage': round(overall_match, 2),
                'required_skills_matched': required_match,
                'preferred_skills_matched': preferred_match,
                'total_required_skills': total_required,
                'total_preferred_skills': total_preferred,
                'salary_range': career_info['salary_range'],
                'career_level': career_info['career_level']
            })
        
        # Sort by match percentage
        suggestions.sort(key=lambda x: x['match_percentage'], reverse=True)
        
        return suggestions[:5]  # Return top 5 suggestions
    
    def get_priority_skills(self, missing_skills, job_requirements):
        """Get priority skills based on job requirements"""
        # Count frequency of missing skills in job requirements
        skill_freq = Counter(missing_skills)
        
        # Create priority list
        priority_skills = []
        for skill in job_requirements:
            if skill in missing_skills:
                priority_skills.append(skill)
        
        # Add any missing skills not in requirements but common
        for skill in missing_skills:
            if skill not in priority_skills:
                priority_skills.append(skill)
        
        return priority_skills
    
    def generate_improvement_plan(self, gap_analysis, time_frame_months=6):
        """Generate a step-by-step improvement plan"""
        plan = {
            'time_frame_months': time_frame_months,
            'total_skills_to_learn': len(gap_analysis['missing_skills']),
            'skills_per_month': round(len(gap_analysis['missing_skills']) / time_frame_months) if time_frame_months > 0 else 0,
            'monthly_milestones': [],
            'recommended_resources': [],
            'action_steps': []
        }
        
        # Create monthly milestones
        missing_skills = gap_analysis['missing_skills']
        skills_per_month = max(1, len(missing_skills) // time_frame_months)
        
        for month in range(1, time_frame_months + 1):
            start_idx = (month - 1) * skills_per_month
            end_idx = min(start_idx + skills_per_month, len(missing_skills))
            
            if start_idx < len(missing_skills):
                month_skills = missing_skills[start_idx:end_idx]
                plan['monthly_milestones'].append({
                    'month': month,
                    'skills_to_learn': month_skills,
                    'estimated_time': f'{len(month_skills) * 2}-4 weeks',  # Assuming 2-4 weeks per skill
                    'milestone': f'Month {month} Goal: Learn {len(month_skills)} skills'
                })
        
        # Add recommended resources
        plan['recommended_resources'] = gap_analysis['learning_recommendations']
        
        # Add action steps
        plan['action_steps'] = [
            f"1. Focus on priority skills: {', '.join(gap_analysis['priority_skills'][:3])}",
            f"2. Complete 1-2 courses per month from recommended resources",
            f"3. Practice skills through projects",
            f"4. Update your resume with new skills",
            f"5. Apply for positions that match your improved skill set"
        ]
        
        return plan
    
    def compare_with_market_trends(self, resume_skills):
        """Compare skills with current market trends"""
        trending_skills = [
            'python', 'machine learning', 'artificial intelligence', 'data science',
            'cloud computing', 'aws', 'azure', 'devops', 'docker', 'kubernetes',
            'react', 'node.js', 'blockchain', 'cybersecurity', 'iot', 'big data'
        ]
        
        trending_matches = [skill for skill in resume_skills if skill in trending_skills]
        trending_gap = [skill for skill in trending_skills if skill not in resume_skills]
        
        return {
            'trending_skills_have': trending_matches,
            'trending_skills_missing': trending_gap[:10],  # Top 10 missing trending skills
            'market_relevance_score': round(len(trending_matches) / len(trending_skills) * 100, 2)
        }


# Example usage
if __name__ == "__main__":
    analyzer = SkillGapAnalyzer()
    
    # Example resume skills
    resume_skills = ['python', 'javascript', 'html', 'css', 'git', 'communication']
    
    # Example job requirements
    job_requirements = ['python', 'javascript', 'react', 'node.js', 'sql', 'aws', 'docker', 'problem solving', 'leadership']
    
    # Analyze skill gaps
    gap_analysis = analyzer.analyze_skill_gaps(resume_skills, job_requirements)
    print("Skill Gap Analysis:", json.dumps(gap_analysis, indent=2))
    
    # Generate improvement plan
    improvement_plan = analyzer.generate_improvement_plan(gap_analysis)
    print("\nImprovement Plan:", json.dumps(improvement_plan, indent=2))
    
    # Compare with market trends
    market_comparison = analyzer.compare_with_market_trends(resume_skills)
    print("\nMarket Comparison:", json.dumps(market_comparison, indent=2))