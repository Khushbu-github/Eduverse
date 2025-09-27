from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from models import User, Student, Teacher, Hod, Semester, Marks, Questions, Resume, Interest
from schemas import (
    HodCreate, HodResponse,
    StudentResponse, StudentSummary,
    TeacherResponse,
    DashboardStats,
    QuestionSetByTeacher, QuestionResponse,
    MarksUpdate, MarksResponse
)
from auth import verify_token, hash_password
from database import get_db
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/hod", tags=["hod"])
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

async def get_current_hod(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.type != "hod":
        raise HTTPException(status_code=403, detail="Not authorized as HOD")
    hod = db.query(Hod).filter(Hod.id == current_user.id).first()
    if not hod:
        raise HTTPException(status_code=404, detail="HOD profile not found")
    return hod

@router.post("/register", response_model=HodResponse)
async def register_hod(hod: HodCreate, db: Session = Depends(get_db)):
    """Register a new HOD"""
    try:
        # Check if email already exists
        if db.query(User).filter(User.email == hod.email).first():
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password and create HOD
        hashed_password = hash_password(hod.password)
        db_hod = Hod(
            name=hod.name,
            email=hod.email,
            password=hashed_password,
            type="hod"
        )
        
        db.add(db_hod)
        db.commit()
        db.refresh(db_hod)
        
        logger.info(f"HOD registered successfully: {db_hod.email}")
        return db_hod
        
    except Exception as e:
        logger.error(f"HOD registration failed: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Registration failed")

@router.get("/profile", response_model=HodResponse)
async def get_hod_profile(current_hod: Hod = Depends(get_current_hod)):
    """Get current HOD's profile"""
    return current_hod

# ========================
# STUDENT MANAGEMENT - SEMESTER WISE
# ========================

@router.get("/students", response_model=List[StudentResponse])
async def get_all_students(current_hod: Hod = Depends(get_current_hod), db: Session = Depends(get_db)):
    """Get all students in the system"""
    students = db.query(Student).all()
    return students

@router.get("/students/semester/{semester_num}", response_model=List[StudentResponse])
async def get_students_by_semester(
    semester_num: int,
    current_hod: Hod = Depends(get_current_hod),
    db: Session = Depends(get_db)
):
    """Get all students in a specific semester (for frontend sem1, sem2 buttons)"""
    if semester_num < 1 or semester_num > 8:
        raise HTTPException(status_code=400, detail="Invalid semester number. Must be between 1 and 8")
    
    students = db.query(Student).join(Semester).filter(
        Semester.current_semester == semester_num
    ).all()
    
    return students

@router.get("/students/summary", response_model=List[StudentSummary])
async def get_students_summary(
    current_hod: Hod = Depends(get_current_hod),
    db: Session = Depends(get_db)
):
    """Get summary of all students with semester info"""
    students_data = []
    students = db.query(Student).all()
    
    for student in students:
        student_summary = {
            "id": student.id,
            "name": student.name,
            "email": student.email,
            "usn": student.usn,
            "current_semester": student.semester.current_semester if student.semester else None
        }
        students_data.append(StudentSummary(**student_summary))
    
    return students_data

@router.get("/students/{student_id}", response_model=StudentResponse)
async def get_student_details(
    student_id: int,
    current_hod: Hod = Depends(get_current_hod),
    db: Session = Depends(get_db)
):
    """Get detailed information about any student"""
    student = db.query(Student).filter(Student.id == student_id).first()
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return student

# ========================
# TEACHER MANAGEMENT
# ========================

@router.get("/teachers", response_model=List[TeacherResponse])
async def get_all_teachers(current_hod: Hod = Depends(get_current_hod), db: Session = Depends(get_db)):
    """Get all teachers in the system"""
    teachers = db.query(Teacher).all()
    return teachers

@router.get("/teachers/{teacher_id}", response_model=TeacherResponse)
async def get_teacher_details(
    teacher_id: int,
    current_hod: Hod = Depends(get_current_hod),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific teacher"""
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    return teacher

@router.get("/teachers/{teacher_id}/students", response_model=List[StudentResponse])
async def get_teacher_students(
    teacher_id: int,
    current_hod: Hod = Depends(get_current_hod),
    db: Session = Depends(get_db)
):
    """Get all students assigned to a specific teacher"""
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    return teacher.students

# ========================
# DASHBOARD & STATISTICS
# ========================

@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_hod_dashboard_stats(
    current_hod: Hod = Depends(get_current_hod),
    db: Session = Depends(get_db)
):
    """Get HOD dashboard statistics"""
    try:
        total_students = db.query(Student).count()
        
        # Count students by semester
        semester_stats = db.query(
            Semester.current_semester,
            func.count(Student.id)
        ).join(Student).group_by(Semester.current_semester).all()
        
        students_by_semester = {f"sem{sem}": count for sem, count in semester_stats}
        
        return DashboardStats(
            total_students=total_students,
            students_by_semester=students_by_semester
        )
        
    except Exception as e:
        logger.error(f"HOD dashboard stats failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load dashboard stats")

@router.get("/dashboard")
async def get_hod_dashboard(
    current_hod: Hod = Depends(get_current_hod),
    db: Session = Depends(get_db)
):
    """Get complete HOD dashboard data"""
    try:
        stats = await get_hod_dashboard_stats(current_hod, db)
        all_students = db.query(Student).count()
        all_teachers = db.query(Teacher).count()
        
        return {
            "hod_profile": current_hod,
            "stats": stats,
            "total_students": all_students,
            "total_teachers": all_teachers
        }
        
    except Exception as e:
        logger.error(f"HOD dashboard failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load dashboard")

# ========================
# STUDENT SEARCH & FILTER
# ========================

@router.get("/students/search/{query}", response_model=List[StudentResponse])
async def search_students(
    query: str,
    current_hod: Hod = Depends(get_current_hod),
    db: Session = Depends(get_db)
):
    """Search students by name, email, or USN"""
    students = db.query(Student).filter(
        (Student.name.ilike(f"%{query}%")) |
        (Student.email.ilike(f"%{query}%")) |
        (Student.usn.ilike(f"%{query}%"))
    ).all()
    
    return students

@router.get("/teachers/search/{query}", response_model=List[TeacherResponse])
async def search_teachers(
    query: str,
    current_hod: Hod = Depends(get_current_hod),
    db: Session = Depends(get_db)
):
    """Search teachers by name or email"""
    teachers = db.query(Teacher).filter(
        (Teacher.name.ilike(f"%{query}%")) |
        (Teacher.email.ilike(f"%{query}%"))
    ).all()
    
    return teachers

# ========================
# ADMINISTRATIVE FUNCTIONS
# ========================

@router.put("/students/{student_id}/marks", response_model=MarksResponse)
async def update_student_marks_admin(
    student_id: int,
    marks_update: MarksUpdate,
    current_hod: Hod = Depends(get_current_hod),
    db: Session = Depends(get_db)
):
    """HOD can update marks for any student"""
    try:
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
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
        logger.error(f"HOD marks update failed: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Marks update failed")

@router.post("/students/{student_id}/questions", response_model=QuestionResponse)
async def set_student_questions_admin(
    student_id: int,
    questions: QuestionSetByTeacher,
    current_hod: Hod = Depends(get_current_hod),
    db: Session = Depends(get_db)
):
    """HOD can set questions for any student"""
    try:
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
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
        logger.error(f"HOD question setting failed: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Question setting failed")

# ========================
# BULK OPERATIONS
# ========================

@router.post("/students/semester/{semester_num}/bulk-questions")
async def set_bulk_questions_by_semester(
    semester_num: int,
    questions: QuestionSetByTeacher,
    current_hod: Hod = Depends(get_current_hod),
    db: Session = Depends(get_db)
):
    """Set same questions for all students in a specific semester"""
    try:
        if semester_num < 1 or semester_num > 8:
            raise HTTPException(status_code=400, detail="Invalid semester number")
        
        students = db.query(Student).join(Semester).filter(
            Semester.current_semester == semester_num
        ).all()
        
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
        logger.info(f"Bulk questions set for {updated_count} students in semester {semester_num}")
        return {"message": f"Questions set for {updated_count} students in semester {semester_num}"}
        
    except Exception as e:
        logger.error(f"Bulk questions setting failed: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Bulk questions setting failed")

# ========================
# REPORTS & ANALYTICS
# ========================

@router.get("/reports/students-without-teachers", response_model=List[StudentResponse])
async def get_students_without_teachers(
    current_hod: Hod = Depends(get_current_hod),
    db: Session = Depends(get_db)
):
    """Get list of students who haven't assigned any teacher"""
    students = db.query(Student).filter(Student.teacher_id == None).all()
    return students

@router.get("/reports/teachers-student-count")
async def get_teachers_student_count(
    current_hod: Hod = Depends(get_current_hod),
    db: Session = Depends(get_db)
):
    """Get count of students assigned to each teacher"""
    teacher_stats = db.query(
        Teacher.id,
        Teacher.name,
        Teacher.email,
        func.count(Student.id).label('student_count')
    ).outerjoin(Student, Teacher.id == Student.teacher_id
    ).group_by(Teacher.id, Teacher.name, Teacher.email).all()
    
    return [
        {
            "teacher_id": stat.id,
            "teacher_name": stat.name,
            "teacher_email": stat.email,
            "student_count": stat.student_count
        }
        for stat in teacher_stats
    ]

@router.get("/reports/semester-wise-distribution")
async def get_semester_wise_distribution(
    current_hod: Hod = Depends(get_current_hod),
    db: Session = Depends(get_db)
):
    """Get detailed semester-wise student distribution"""
    semester_stats = db.query(
        Semester.current_semester,
        func.count(Student.id).label('student_count')
    ).join(Student).group_by(Semester.current_semester).all()
    
    return {
        f"semester_{stat.current_semester}": {
            "semester": stat.current_semester,
            "student_count": stat.student_count
        }
        for stat in semester_stats
    }