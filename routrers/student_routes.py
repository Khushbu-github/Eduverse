from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File,UploadFile
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from models import User, Student, Teacher, Resume, Semester, Marks, Questions, Interest
from schemas import (
    StudentCreate, StudentResponse, StudentUpdate, StudentAssignTeacher,
    ResumeCreate, ResumeResponse, ResumeUpdate,
    SemesterCreate, SemesterUpdate, SemesterResponse,
    MarksUpdate, MarksResponse,
    QuestionUpdate, QuestionResponse,
    InterestCreate, InterestResponse, InterestUpdate,ResumeData,
    QuestionSetByTeacher,TeacherResponse
)
from langchain.prompts import PromptTemplate
from auth import verify_token, hash_password
from database import get_db
from typing import List,Optional
import logging
import fitz  # PyMuPDF for PDF parsing
import tempfile
import json
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate
import os
from dotenv import load_dotenv
from pydantic import BaseModel,Field
import re
import PyPDF2
import docx
import io
from langchain.schema import BaseOutputParser

load_dotenv()
logger = logging.getLogger(__name__)
router = APIRouter(prefix="/students", tags=["students"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
GROQ_API_KEY =os.getenv("GROQ_API_KEY")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    email = verify_token(token)
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

async def get_current_student(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.type != "student":
        raise HTTPException(status_code=403, detail="Not authorized as student")
    student = db.query(Student).filter(Student.id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student


@router.post("/register", response_model=StudentResponse)
async def register_student(student: StudentCreate, db: Session = Depends(get_db)):
    """Register a new student"""
    try:
        # Check if email or USN already exists
        if db.query(User).filter(User.email == student.email).first():
            raise HTTPException(status_code=400, detail="Email already registered")
        
        if db.query(Student).filter(Student.usn == student.usn).first():
            raise HTTPException(status_code=400, detail="USN already registered")
        
        # Hash password and create student
        hashed_password = hash_password(student.password)
        db_student = Student(
            name=student.name,
            email=student.email,
            password=hashed_password,
            type="student",
            usn=student.usn,
            leetcodeurl=student.leetcodeurl,
            githuburl=student.githuburl,
            teacher_id=student.teacher_id
        )
        
        db.add(db_student)
        db.commit()
        db.refresh(db_student)
        
        # Initialize default records
        db_semester = Semester(student_id=db_student.id, current_semester=1)
        db_marks = Marks(student_id=db_student.id)
        db.add(db_semester)
        db.add(db_marks)
        db.commit()
        
        logger.info(f"Student registered successfully: {db_student.email}")
        return db_student
        
    except Exception as e:
        logger.error(f"Student registration failed: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Registration failed")

@router.get("/profile", response_model=StudentResponse)
async def get_student_profile(current_student: Student = Depends(get_current_student)):
    """Get current student's complete profile"""
    return current_student

@router.put("/profile", response_model=StudentResponse)
async def update_student_profile(
    student_update: StudentUpdate,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Update student profile details"""
    try:
        for key, value in student_update.dict(exclude_unset=True).items():
            setattr(current_student, key, value)
        
        db.commit()
        db.refresh(current_student)
        logger.info(f"Student profile updated: {current_student.id}")
        return current_student
        
    except Exception as e:
        logger.error(f"Profile update failed: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Profile update failed")

@router.post("/assign-teacher", response_model=StudentResponse)
async def assign_teacher_to_student(
    assignment: StudentAssignTeacher,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Student assigns themselves to a teacher"""
    try:
        # Verify teacher exists
        teacher = db.query(Teacher).filter(Teacher.id == assignment.teacher_id).first()
        if not teacher:
            raise HTTPException(status_code=404, detail="Teacher not found")
        
        current_student.teacher_id = assignment.teacher_id
        db.commit()
        db.refresh(current_student)
        
        logger.info(f"Student {current_student.id} assigned to teacher {assignment.teacher_id}")
        return current_student
        
    except Exception as e:
        logger.error(f"Teacher assignment failed: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Teacher assignment failed")


@router.post("/resume", response_model=ResumeResponse)
async def create_or_update_resume(
    resume: ResumeCreate,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Create or update student resume"""
    try:
        existing_resume = db.query(Resume).filter(Resume.student_id == current_student.id).first()
        
        if existing_resume:
            # Update existing resume
            for key, value in resume.dict(exclude_unset=True).items():
                setattr(existing_resume, key, value)
            db.commit()
            db.refresh(existing_resume)
            return existing_resume
        else:
            # Create new resume
            db_resume = Resume(student_id=current_student.id, **resume.dict())
            db.add(db_resume)
            db.commit()
            db.refresh(db_resume)
            return db_resume
            
    except Exception as e:
        logger.error(f"Resume update failed: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Resume update failed")

@router.get("/resume", response_model=ResumeResponse)
async def get_student_resume(current_student: Student = Depends(get_current_student)):
    """Get student's resume"""
    if not current_student.resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return current_student.resume

@router.put("/resume", response_model=ResumeResponse)
async def update_resume(
    resume_update: ResumeUpdate,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Update existing resume"""
    try:
        existing_resume = db.query(Resume).filter(Resume.student_id == current_student.id).first()
        if not existing_resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        for key, value in resume_update.dict(exclude_unset=True).items():
            setattr(existing_resume, key, value)
        
        db.commit()
        db.refresh(existing_resume)
        return existing_resume
        
    except Exception as e:
        logger.error(f"Resume update failed: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Resume update failed")

@router.put("/semester", response_model=SemesterResponse)
async def update_semester(
    semester_update: SemesterUpdate,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Update current semester"""
    try:
        existing_semester = db.query(Semester).filter(Semester.student_id == current_student.id).first()
        
        if existing_semester:
            existing_semester.current_semester = semester_update.current_semester
        else:
            existing_semester = Semester(
                student_id=current_student.id,
                current_semester=semester_update.current_semester
            )
            db.add(existing_semester)
        
        db.commit()
        db.refresh(existing_semester)
        return existing_semester
        
    except Exception as e:
        logger.error(f"Semester update failed: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Semester update failed")

@router.put("/marks", response_model=MarksResponse)
async def update_marks(
    marks_update: MarksUpdate, 
    current_student: Student = Depends(get_current_student), 
    db: Session = Depends(get_db)
):
    try:
        logger.info(f"=== MARKS UPDATE START ===")
        logger.info(f"Student ID: {current_student.id}")
        
        # Get semester info
        sem = db.query(Semester).filter(Semester.student_id == current_student.id).first()
        if not sem:
            logger.error("No semester info found")
            raise HTTPException(status_code=400, detail="Semester info missing")
        
        current_sem = sem.current_semester
        logger.info(f"Current semester: {current_sem}")
        
        # Get or create marks record
        existing_marks = db.query(Marks).filter(Marks.student_id == current_student.id).first()
        if not existing_marks:
            logger.info("Creating new marks record")
            existing_marks = Marks(student_id=current_student.id)
            db.add(existing_marks)
            db.flush()  # Flush instead of commit to keep transaction open
        
        # Log current marks state
        logger.info(f"Current marks in DB: sem1_marks={existing_marks.sem1_marks}, sem2_marks={existing_marks.sem2_marks}")
        
        # Get the update data
        update_data = marks_update.dict(exclude_unset=True)
        logger.info(f"Received update data: {update_data}")
        
        # Map of field names to semester numbers
        key_to_sem = {
            'sem1_marks': 1, 'sem2_marks': 2, 'sem3_marks': 3, 'sem4_marks': 4,
            'sem5_marks': 5, 'sem6_marks': 6, 'sem7_marks': 7, 'sem8_marks': 8,
        }

        updated_fields = []
        for key, value in update_data.items():
            logger.info(f"Processing field: {key} = {value}")
            
            sem_no = key_to_sem.get(key)
            if sem_no is None:
                logger.warning(f"Unknown field: {key}")
                continue
            
            logger.info(f"Field {key} maps to semester {sem_no}")
            
            # Check if semester is allowed (completed semesters only)
            if sem_no >= current_sem:
                logger.error(f"Cannot update semester {sem_no}, current semester is {current_sem}")
                raise HTTPException(
                    status_code=403, 
                    detail=f"Cannot update marks for semester {sem_no}. Current semester is {current_sem}."
                )
            
            # Validate value
            if value is not None:
                if not isinstance(value, (int, float)) or value < 0 or value > 10:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Invalid value for {key}: {value}. Must be between 0 and 10."
                    )
            
            # Update the field
            old_value = getattr(existing_marks, key)
            setattr(existing_marks, key, value)
            updated_fields.append(f"{key}: {old_value} -> {value}")
            logger.info(f"Updated {key}: {old_value} -> {value}")

        logger.info(f"Updated fields: {updated_fields}")
        
        # Commit the changes
        db.commit()
        db.refresh(existing_marks)
        
        # Log final state
        logger.info(f"Final marks in DB: sem1_marks={existing_marks.sem1_marks}, sem2_marks={existing_marks.sem2_marks}")
        logger.info(f"=== MARKS UPDATE SUCCESS ===")
        
        return existing_marks

    except HTTPException:
        logger.error("HTTPException occurred, rolling back")
        db.rollback()
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Marks update failed: {str(e)}")

@router.get("/marks", response_model=MarksResponse)
async def get_student_marks(
    current_student: Student = Depends(get_current_student), 
    db: Session = Depends(get_db)
):
    try:
        marks = db.query(Marks).filter(Marks.student_id == current_student.id).first()
        if not marks:
            # Create blank record
            marks = Marks(student_id=current_student.id)
            db.add(marks)
            db.commit()
            db.refresh(marks)
        
        logger.info(f"Retrieved marks for student {current_student.id}: {marks}")
        return marks
        
    except Exception as e:
        logger.error(f"Failed to get marks: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve marks")



@router.put("/questions/answers", response_model=QuestionResponse)
async def update_question_answers(
    answers: QuestionUpdate,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Update answers to questions set by teacher"""
    try:
        existing_questions = db.query(Questions).filter(Questions.student_id == current_student.id).first()
        if not existing_questions:
            raise HTTPException(status_code=404, detail="No questions assigned by teacher")
        
        # Update only answer fields
        for key, value in answers.dict(exclude_unset=True).items():
            if value is not None and key.startswith('answer'):
                setattr(existing_questions, key, value)
        
        db.commit()
        db.refresh(existing_questions)
        return existing_questions
        
    except Exception as e:
        logger.error(f"Answer update failed: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Answer update failed")

@router.get("/questions", response_model=QuestionResponse)
async def get_student_questions(current_student: Student = Depends(get_current_student)):
    """Get questions assigned to student"""
    if not current_student.questions:
        raise HTTPException(status_code=404, detail="No questions assigned")
    return current_student.questions

@router.post("/interests", response_model=InterestResponse)
async def create_interest(
    interest: InterestCreate,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Add new interest"""
    try:
        db_interest = Interest(student_id=current_student.id, **interest.dict())
        db.add(db_interest)
        db.commit()
        db.refresh(db_interest)
        return db_interest
        
    except Exception as e:
        logger.error(f"Interest creation failed: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Interest creation failed")

@router.get("/interests", response_model=List[InterestResponse])
async def get_student_interests(current_student: Student = Depends(get_current_student)):
    """Get all student interests"""
    return current_student.interests

@router.put("/interests/{interest_id}", response_model=InterestResponse)
async def update_interest(
    interest_id: int,
    interest_update: InterestUpdate,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Update specific interest"""
    try:
        interest = db.query(Interest).filter(
            Interest.id == interest_id,
            Interest.student_id == current_student.id
        ).first()
        
        if not interest:
            raise HTTPException(status_code=404, detail="Interest not found")
        
        for key, value in interest_update.dict(exclude_unset=True).items():
            if value is not None:
                setattr(interest, key, value)
        
        db.commit()
        db.refresh(interest)
        return interest
        
    except Exception as e:
        logger.error(f"Interest update failed: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Interest update failed")

@router.delete("/interests/{interest_id}")
async def delete_interest(
    interest_id: int,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Delete specific interest"""
    try:
        interest = db.query(Interest).filter(
            Interest.id == interest_id,
            Interest.student_id == current_student.id
        ).first()
        
        if not interest:
            raise HTTPException(status_code=404, detail="Interest not found")
        
        db.delete(interest)
        db.commit()
        return {"message": "Interest deleted successfully"}
        
    except Exception as e:
        logger.error(f"Interest deletion failed: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Interest deletion failed")

@router.get("/dashboard", response_model=StudentResponse)
async def get_student_dashboard(current_student: Student = Depends(get_current_student)):
    """Get complete student dashboard data"""
    return current_student

class ResumeOutputParser(BaseOutputParser[ResumeData]):
    def parse(self, text: str) -> ResumeData:
        try:
            # Clean the response text
            cleaned_text = text.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text.replace("```json", "").replace("```", "").strip()
            
            data = json.loads(cleaned_text)
            return ResumeData(**data)
        except (json.JSONDecodeError, Exception):
            # Return empty structure if parsing fails
            return ResumeData(
                skills="", achievements="", certifications="", 
                hobbies="", experience="", education="", projects=""
            )
    
    def get_format_instructions(self) -> str:
        return """Return a valid JSON object with these exact fields:
{
  "skills": "comma-separated skills",
  "achievements": "achievements separated by newlines",
  "certifications": "certifications separated by newlines", 
  "hobbies": "comma-separated hobbies and interests",
  "experience": "work experience details",
  "education": "education details",
  "projects": "project details"
}"""

def extract_text_from_file(file: UploadFile) -> str:
    """Extract text from uploaded resume file"""
    try:
        if file.content_type == "application/pdf":
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file.file.read()))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text
        
        elif file.content_type in ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
            doc = docx.Document(io.BytesIO(file.file.read()))
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        
        elif file.content_type == "text/plain":
            content = file.file.read()
            return content.decode('utf-8')
        
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, DOCX, or TXT files.")
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")

async def process_resume_with_ai(text: str) -> ResumeData:
    """Process resume text using LangChain and Groq"""
    
    # Initialize LLM
    llm = ChatGroq(
        groq_api_key=GROQ_API_KEY,
        model_name="openai/gpt-oss-20b",
        temperature=0.1
    )
    
    # Create output parser
    output_parser = ResumeOutputParser()
    
    # Create prompt template
    prompt_template = PromptTemplate(
        input_variables=["resume_text"],
        template="""
You are an expert resume parser. Extract information from the resume text and return ONLY a valid JSON object.

EXTRACTION RULES:
- Skills: Include both technical and soft skills, comma-separated
- Achievements: Awards, honors, accomplishments with metrics if available, newline-separated
- Certifications: Professional certifications, licenses, courses, newline-separated  
- Hobbies: Interests, volunteer work, extracurricular activities, comma-separated
- Experience: Company, role, duration, key responsibilities for each job
- Education: Institution, degree, major, graduation date, GPA if mentioned
- Projects: Project name, technologies used, description, your role

Resume Text:
{resume_text}

{format_instructions}

JSON Response:""",
        partial_variables={"format_instructions": output_parser.get_format_instructions()}
    )
    
    # Create chain
    chain = prompt_template | llm | output_parser
    
    try:
        result = await chain.ainvoke({"resume_text": text})
        return result
    except Exception as e:
        # Return empty structure if AI processing fails
        return ResumeData(
            skills="", achievements="", certifications="", 
            hobbies="", experience="", education="", projects=""
        )

@router.post("/upload/resume", response_model=ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_student=Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Upload and process resume file for first time"""
    
    # Validate file
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # Extract text from file
    resume_text = extract_text_from_file(file)
    
    if len(resume_text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Resume content is too short")
    
    # Check if resume already exists
    existing_resume = db.query(Resume).filter(Resume.student_id == current_student.id).first()
    if existing_resume:
        raise HTTPException(status_code=400, detail="Resume already exists. Use update endpoint instead.")
    
    # Process with AI
    extracted_data = await process_resume_with_ai(resume_text)
    
    # Save to database
    new_resume = Resume(
        student_id=current_student.id,
        skills=extracted_data.skills,
        achievements=extracted_data.achievements,
        certifications=extracted_data.certifications,
        hobbies=extracted_data.hobbies,
        experience=extracted_data.experience,
        education=extracted_data.education,
        projects=extracted_data.projects
    )
    
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)
    return new_resume

@router.put("/update/resume", response_model=ResumeResponse)
async def update_resume1(
    file: UploadFile = File(...),
    current_student=Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Update existing resume with new file"""
    
    # Check if resume exists
    existing_resume = db.query(Resume).filter(Resume.student_id == current_student.id).first()
    if not existing_resume:
        raise HTTPException(status_code=404, detail="Resume not found. Use upload endpoint first.")
    
    # Extract text from new file
    resume_text = extract_text_from_file(file)
    
    if len(resume_text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Resume content is too short")
    
    # Process with AI
    extracted_data = await process_resume_with_ai(resume_text)
    
    # Update existing resume
    existing_resume.skills = extracted_data.skills
    existing_resume.achievements = extracted_data.achievements
    existing_resume.certifications = extracted_data.certifications
    existing_resume.hobbies = extracted_data.hobbies
    existing_resume.experience = extracted_data.experience
    existing_resume.education = extracted_data.education
    existing_resume.projects = extracted_data.projects
    
    db.commit()
    db.refresh(existing_resume)
    return existing_resume
@router.get("/getcurrentsemister",response_model=int)
async def get_current_semister(current_student: Student = Depends(get_current_student)):
    """Get current semester of the student"""
    if not current_student.semester:
        raise HTTPException(status_code=404, detail="Semester information not found")
    return current_student.semester.current_semester
@router.get("/getteachers",response_model=List[TeacherResponse])
async def get_all_teachers(db: Session = Depends(get_db)):
    """Get list of all teachers"""
    teachers = db.query(Teacher).all()
    return teachers