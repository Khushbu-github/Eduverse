from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from models import User, Student, Teacher, Questions, Semester, Marks, Resume, Interest
from schemas import (
    TeacherCreate, TeacherResponse, TeacherUpdate, TeacherStats,
    StudentResponse, StudentSummary,
    QuestionSetByTeacher, QuestionResponse,
    MarksUpdate, MarksResponse
)
from auth import verify_token, hash_password
from database import get_db
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/teachers", tags=["teachers"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Authentication Dependencies
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

async def get_current_teacher(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.type != "teacher":
        raise HTTPException(status_code=403, detail="Not authorized as teacher")
    teacher = db.query(Teacher).filter(Teacher.id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")
    return teacher

# ========================
# TEACHER REGISTRATION & PROFILE
# ========================

@router.post("/register", response_model=TeacherResponse)
async def register_teacher(teacher: TeacherCreate, db: Session = Depends(get_db)):
    """Register a new teacher"""
    try:
        # Check if email already exists
        if db.query(User).filter(User.email == teacher.email).first():
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password and create teacher
        hashed_password = hash_password(teacher.password)
        db_teacher = Teacher(
            name=teacher.name,
            email=teacher.email,
            password=hashed_password,
            type="teacher"
        )
        
        db.add(db_teacher)
        db.commit()
        db.refresh(db_teacher)
        
        logger.info(f"Teacher registered successfully: {db_teacher.email}")
        return db_teacher
        
    except Exception as e:
        logger.error(f"Teacher registration failed: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Registration failed")

@router.get("/profile", response_model=TeacherResponse)
async def get_teacher_profile(current_teacher: Teacher = Depends(get_current_teacher)):
    """Get current teacher's profile"""
    return current_teacher

@router.put("/profile", response_model=TeacherResponse)
async def update_teacher_profile(
    teacher_update: TeacherUpdate,
    current_teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Update teacher profile"""
    try:
        for key, value in teacher_update.dict(exclude_unset=True).items():
            setattr(current_teacher, key, value)
        
        db.commit()
        db.refresh(current_teacher)
        logger.info(f"Teacher profile updated: {current_teacher.id}")
        return current_teacher
        
    except Exception as e:
        logger.error(f"Teacher profile update failed: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Profile update failed")

# ========================
# STUDENT MANAGEMENT
# ========================

@router.get("/students", response_model=List[StudentResponse])
async def get_assigned_students(current_teacher: Teacher = Depends(get_current_teacher)):
    """Get all students assigned to this teacher"""
    return current_teacher.students

@router.get("/students/summary", response_model=List[StudentSummary])
async def get_students_summary(
    current_teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Get summary of assigned students with semester info"""
    students_data = []
    for student in current_teacher.students:
        student_summary = {
            "id": student.id,
            "name": student.name,
            "email": student.email,
            "usn": student.usn,
            "current_semester": student.semester.current_semester if student.semester else None
        }
        students_data.append(StudentSummary(**student_summary))
    
    return students_data

@router.get("/students/semester/{semester_num}", response_model=List[StudentResponse])
async def get_students_by_semester(
    semester_num: int,
    current_teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Get students in specific semester assigned to this teacher"""
    students = db.query(Student).join(Semester).filter(
        Student.teacher_id == current_teacher.id,
        Semester.current_semester == semester_num
    ).all()
    
    return students

@router.get("/students/{student_id}", response_model=StudentResponse)
async def get_student_details(
    student_id: int,
    current_teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific student"""
    student = db.query(Student).filter(
        Student.id == student_id,
        Student.teacher_id == current_teacher.id
    ).first()
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found or not assigned to you")
    
    return student

# ========================
# QUESTION MANAGEMENT
# ========================

@router.post("/students/{student_id}/questions", response_model=QuestionResponse)
async def set_student_questions(
    student_id: int,
    questions: QuestionSetByTeacher,
    current_teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Set questions for a specific student"""
    try:
        # Verify student is assigned to this teacher
        student = db.query(Student).filter(
            Student.id == student_id,
            Student.teacher_id == current_teacher.id
        ).first()
        
        if not student:
            raise HTTPException(status_code=404, detail="Student not found or not assigned to you")
        
        # Check if questions already exist
        existing_questions = db.query(Questions).filter(Questions.student_id == student_id).first()
        
        if existing_questions:
            # Update existing questions
            for key, value in questions.dict(exclude_unset=True).items():
                if value is not None:
                    setattr(existing_questions, key, value)
            db.commit()
            db.refresh(existing_questions)
            return existing_questions
        else:
            # Create new questions
            db_questions = Questions(student_id=student_id, **questions.dict())
            db.add(db_questions)
            db.commit()
            db.refresh(db_questions)
            return db_questions
            
    except Exception as e:
        logger.error(f"Question setting failed: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Question setting failed")

@router.get("/students/{student_id}/questions", response_model=QuestionResponse)
async def get_student_questions(
    student_id: int,
    current_teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Get questions and answers for a specific student"""
    # Verify student is assigned to this teacher
    student = db.query(Student).filter(
        Student.id == student_id,
        Student.teacher_id == current_teacher.id
    ).first()
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found or not assigned to you")
    
    if not student.questions:
        raise HTTPException(status_code=404, detail="No questions set for this student")
    
    return student.questions

@router.put("/students/{student_id}/questions", response_model=QuestionResponse)
async def update_student_questions(
    student_id: int,
    questions: QuestionSetByTeacher,
    current_teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Update questions for a specific student"""
    try:
        # Verify student is assigned to this teacher
        student = db.query(Student).filter(
            Student.id == student_id,
            Student.teacher_id == current_teacher.id
        ).first()
        
        if not student:
            raise HTTPException(status_code=404, detail="Student not found or not assigned to you")
        
        existing_questions = db.query(Questions).filter(Questions.student_id == student_id).first()
        if not existing_questions:
            raise HTTPException(status_code=404, detail="No questions found for this student")
        
        # Update questions only (preserve answers)
        for key, value in questions.dict(exclude_unset=True).items():
            if value is not None and key.startswith('question'):
                setattr(existing_questions, key, value)
        
        db.commit()
        db.refresh(existing_questions)
        return existing_questions
        
    except Exception as e:
        logger.error(f"Question update failed: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Question update failed")

# ========================
# MARKS MANAGEMENT
# ========================

@router.put("/students/{student_id}/marks", response_model=MarksResponse)
async def update_student_marks(
    student_id: int,
    marks_update: MarksUpdate,
    current_teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Update marks for a specific student (Teacher can edit marks)"""
    try:
        # Verify student is assigned to this teacher
        student = db.query(Student).filter(
            Student.id == student_id,
            Student.teacher_id == current_teacher.id
        ).first()
        
        if not student:
            raise HTTPException(status_code=404, detail="Student not found or not assigned to you")
        
        existing_marks = db.query(Marks).filter(Marks.student_id == student_id).first()
        
        if existing_marks:
            for key, value in marks_update.dict(exclude_unset=True).items():
                if value is not None:
                    setattr(existing_marks, key, value)
        else:
            existing_marks = Marks(student_id=student_id, **marks_update.dict())
            db.add(existing_marks)
        
        db.commit()
        db.refresh(existing_marks)
        return existing_marks
        
    except Exception as e:
        logger.error(f"Marks update failed: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Marks update failed")

@router.get("/students/{student_id}/marks", response_model=MarksResponse)
async def get_student_marks(
    student_id: int,
    current_teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Get marks for a specific student"""
    # Verify student is assigned to this teacher
    student = db.query(Student).filter(
        Student.id == student_id,
        Student.teacher_id == current_teacher.id
    ).first()
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found or not assigned to you")
    
    if not student.marks:
        raise HTTPException(status_code=404, detail="No marks found for this student")
    
    return student.marks

# ========================
# DASHBOARD & STATISTICS
# ========================

@router.get("/dashboard/stats", response_model=TeacherStats)
async def get_teacher_dashboard_stats(
    current_teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Get teacher dashboard statistics"""
    try:
        total_students = len(current_teacher.students)
        
        # Count students by semester
        semester_stats = db.query(
            Semester.current_semester,
            func.count(Student.id)
        ).join(Student).filter(
            Student.teacher_id == current_teacher.id
        ).group_by(Semester.current_semester).all()
        
        students_by_semester = {f"sem{sem}": count for sem, count in semester_stats}
        
        return TeacherStats(
            total_assigned_students=total_students,
            students_by_semester=students_by_semester
        )
        
    except Exception as e:
        logger.error(f"Dashboard stats failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load dashboard stats")

@router.get("/dashboard", response_model=TeacherResponse)
async def get_teacher_dashboard(current_teacher: Teacher = Depends(get_current_teacher)):
    """Get complete teacher dashboard data"""
    return current_teacher

# ========================
# STUDENT SEARCH & FILTER
# ========================

@router.get("/students/search/{query}", response_model=List[StudentResponse])
async def search_assigned_students(
    query: str,
    current_teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Search students by name, email, or USN (only assigned students)"""
    students = db.query(Student).filter(
        Student.teacher_id == current_teacher.id,
        (Student.name.ilike(f"%{query}%")) |
        (Student.email.ilike(f"%{query}%")) |
        (Student.usn.ilike(f"%{query}%"))
    ).all()
    
    return students

# ========================
# BULK OPERATIONS
# ========================

@router.post("/students/bulk-questions")
async def set_bulk_questions(
    questions: QuestionSetByTeacher,
    current_teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Set same questions for all assigned students"""
    try:
        updated_count = 0
        for student in current_teacher.students:
            existing_questions = db.query(Questions).filter(Questions.student_id == student.id).first()
            
            if existing_questions:
                # Update existing questions
                for key, value in questions.dict(exclude_unset=True).items():
                    if value is not None:
                        setattr(existing_questions, key, value)
            else:
                # Create new questions
                new_questions = Questions(student_id=student.id, **questions.dict())
                db.add(new_questions)
            
            updated_count += 1
        
        db.commit()
        logger.info(f"Bulk questions set for {updated_count} students by teacher {current_teacher.id}")
        return {"message": f"Questions set for {updated_count} students"}
        
    except Exception as e:
        logger.error(f"Bulk questions setting failed: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Bulk questions setting failed")
    
# Set same questions for students in same semester
@router.post("/students/semester/{semester_num}/bulk-questions")
async def set_bulk_questions_by_semester(
    semester_num: int,
    questions: QuestionSetByTeacher,
    current_teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Set same questions for all students in a specific semester assigned to this teacher"""
    try:
        if semester_num < 1 or semester_num > 8:
            raise HTTPException(status_code=400, detail="Invalid semester number")
        
        # Get students in specific semester assigned to current teacher
        students = db.query(Student).join(Semester).filter(
            Student.teacher_id == current_teacher.id,  # Only teacher's assigned students
            Semester.current_semester == semester_num
        ).all()
        
        if not students:
            raise HTTPException(
                status_code=404, 
                detail=f"No students found in semester {semester_num} assigned to you"
            )
        
        updated_count = 0
        for student in students:
            existing_questions = db.query(Questions).filter(Questions.student_id == student.id).first()
            
            if existing_questions:
                # Update existing questions
                for key, value in questions.dict(exclude_unset=True).items():
                    if value is not None:
                        setattr(existing_questions, key, value)
            else:
                # Create new questions
                new_questions = Questions(student_id=student.id, **questions.dict())
                db.add(new_questions)
            
            updated_count += 1
        
        db.commit()
        logger.info(f"Bulk questions set for {updated_count} students in semester {semester_num} by teacher {current_teacher.id}")
        return {
            "message": f"Questions set for {updated_count} students in semester {semester_num}",
            "semester": semester_num,
            "students_updated": updated_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Bulk questions setting failed: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Bulk questions setting failed")

@router.get("/students/semester/{semester_num}", response_model=List[StudentResponse])
async def get_students_by_semester1(
    semester_num: int, 
    current_teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Get students in a specific semester assigned to this teacher"""
    try:
        if semester_num < 1 or semester_num > 8:
            raise HTTPException(status_code=400, detail="Invalid semester number")
        
        # Query students in specific semester assigned to current teacher
        students = db.query(Student).join(Semester).filter(
            Student.teacher_id == current_teacher.id,
            Semester.current_semester == semester_num
        ).all()
        
        if not students:
            return []  # Return empty list instead of error for better UX
        
        return students
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get students by semester: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve students")

# Additional helper endpoint to get semester statistics
@router.get("/students/semester/{semester_num}/stats")
async def get_semester_stats(
    semester_num: int,
    current_teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Get statistics for students in a specific semester"""
    try:
        if semester_num < 1 or semester_num > 8:
            raise HTTPException(status_code=400, detail="Invalid semester number")
        
        students = db.query(Student).join(Semester).filter(
            Student.teacher_id == current_teacher.id,
            Semester.current_semester == semester_num
        ).all()
        
        # Count students with questions set
        students_with_questions = db.query(Student).join(Semester).join(Questions).filter(
            Student.teacher_id == current_teacher.id,
            Semester.current_semester == semester_num
        ).count()
        
        # Count students with marks
        students_with_marks = db.query(Student).join(Semester).join(Marks).filter(
            Student.teacher_id == current_teacher.id,
            Semester.current_semester == semester_num
        ).count()
        
        return {
            "semester": semester_num,
            "total_students": len(students),
            "students_with_questions": students_with_questions,
            "students_with_marks": students_with_marks,
            "completion_percentage": {
                "questions": round((students_with_questions / len(students)) * 100, 2) if students else 0,
                "marks": round((students_with_marks / len(students)) * 100, 2) if students else 0
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get semester stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve semester statistics")