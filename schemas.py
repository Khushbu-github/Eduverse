from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

from pydantic import BaseModel
from typing import Optional

class ResumeBase(BaseModel):
    skills: Optional[str] = None
    achievements: Optional[str] = None
    certifications: Optional[str] = None
    hobbies: Optional[str] = None
    experience: Optional[str] = None
    education: Optional[str] = None
    projects: Optional[str] = None

class ResumeCreate(ResumeBase):
    pass

class ResumeUpdate(ResumeBase):
    pass

class ResumeResponse(ResumeBase):
    id: int
    student_id: int
    resume_file_path: Optional[str] = None

    class Config:
        from_attributes = True

class SemesterBase(BaseModel):
    current_semester: int

class SemesterCreate(SemesterBase):
    pass

class SemesterUpdate(SemesterBase):
    pass

class SemesterResponse(SemesterBase):
    id: int
    student_id: int

    class Config:
        from_attributes = True

class MarksBase(BaseModel):
    sem1_marks: Optional[int] = Field(None, alias='sem1')
    sem2_marks: Optional[int] = Field(None, alias='sem2')
    sem3_marks: Optional[int] = Field(None, alias='sem3')
    sem4_marks: Optional[int] = Field(None, alias='sem4')
    sem5_marks: Optional[int] = Field(None, alias='sem5')
    sem6_marks: Optional[int] = Field(None, alias='sem6')
    sem7_marks: Optional[int] = Field(None, alias='sem7')
    sem8_marks: Optional[int] = Field(None, alias='sem8')

    class Config:
        populate_by_name = True

class MarksCreate(MarksBase):
    pass

class MarksUpdate(BaseModel):
    sem1_marks: Optional[int] = Field(None, alias='sem1')
    sem2_marks: Optional[int] = Field(None, alias='sem2')
    sem3_marks: Optional[int] = Field(None, alias='sem3')
    sem4_marks: Optional[int] = Field(None, alias='sem4')
    sem5_marks: Optional[int] = Field(None, alias='sem5')
    sem6_marks: Optional[int] = Field(None, alias='sem6')
    sem7_marks: Optional[int] = Field(None, alias='sem7')
    sem8_marks: Optional[int] = Field(None, alias='sem8')
    
    class Config:
        populate_by_name = True

class MarksResponse(MarksBase):
    id: int
    student_id: int

    class Config:
        from_attributes = True
class MarksResponse(BaseModel):
    id: int
    student_id: int
    sem1_marks: Optional[int] = Field(None, alias='sem1')
    sem2_marks: Optional[int] = Field(None, alias='sem2')
    sem3_marks: Optional[int] = Field(None, alias='sem3')
    sem4_marks: Optional[int] = Field(None, alias='sem4')
    sem5_marks: Optional[int] = Field(None, alias='sem5')
    sem6_marks: Optional[int] = Field(None, alias='sem6')
    sem7_marks: Optional[int] = Field(None, alias='sem7')
    sem8_marks: Optional[int] = Field(None, alias='sem8')
    
    class Config:
        from_attributes = True
        populate_by_name = True

class QuestionBase(BaseModel):
    question1: Optional[str] = None
    answer1: Optional[str] = None
    question2: Optional[str] = None
    answer2: Optional[str] = None
    question3: Optional[str] = None
    answer3: Optional[str] = None
    question4: Optional[str] = None
    answer4: Optional[str] = None
    question5: Optional[str] = None
    answer5: Optional[str] = None

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    answer1: Optional[str] = None
    answer2: Optional[str] = None
    answer3: Optional[str] = None
    answer4: Optional[str] = None
    answer5: Optional[str] = None

class QuestionSetByTeacher(BaseModel):
    question1: Optional[str] = None
    question2: Optional[str] = None
    question3: Optional[str] = None
    question4: Optional[str] = None
    question5: Optional[str] = None

class QuestionResponse(QuestionBase):
    id: int
    student_id: int

    class Config:
        from_attributes = True

class InterestBase(BaseModel):
    category: Optional[str] = None
    activity: Optional[str] = None
    level: Optional[str] = None
    achievements: Optional[str] = None

class InterestCreate(InterestBase):
    pass

class InterestUpdate(InterestBase):
    pass

class InterestResponse(InterestBase):
    id: int
    student_id: int

    class Config:
        from_attributes = True

class StudentBase(BaseModel):
    usn: str
    leetcodeurl: Optional[str] = None
    githuburl: Optional[str] = None
    teacher_id: Optional[int] = None

class StudentCreate(StudentBase, UserCreate):
    role: str = "student"

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    leetcodeurl: Optional[str] = None
    githuburl: Optional[str] = None
    teacher_id: Optional[int] = None

class StudentAssignTeacher(BaseModel):
    teacher_id: int

class StudentResponse(StudentBase, UserResponse):
    teacher: Optional['TeacherResponse'] = None
    resume: Optional[ResumeResponse] = None
    semester: Optional[SemesterResponse] = None
    marks: Optional[MarksResponse] = None
    questions: Optional[QuestionResponse] = None
    interests: List[InterestResponse] = []

    class Config:
        from_attributes = True

class StudentSummary(BaseModel):
    id: int
    name: str
    email: str
    usn: str
    current_semester: Optional[int] = None
    
    class Config:
        from_attributes = True

class TeacherCreate(UserCreate):
    role: str = "teacher"

class TeacherUpdate(BaseModel):
    name: Optional[str] = None

class TeacherResponse(UserResponse):
    students: List[StudentSummary] = []

    class Config:
        from_attributes = True

class HodCreate(UserCreate):
    role: str = "hod"

class HodResponse(UserResponse):
    pass

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user_role: str
    user_id: int

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class DashboardStats(BaseModel):
    total_students: int
    students_by_semester: dict
    
class TeacherStats(BaseModel):
    total_assigned_students: int
    students_by_semester: dict

# File upload schema
class ResumeUpload(BaseModel):
    file_content: str  # Base64 encoded file content
    filename: str




class ResumeData(BaseModel):
    skills: str = Field(description="Comma-separated technical and soft skills")
    achievements: str = Field(description="Achievements and awards, newline separated")
    certifications: str = Field(description="Certifications and licenses, newline separated")
    hobbies: str = Field(description="Hobbies and interests, comma-separated")
    experience: str = Field(description="Work experience with companies, roles, dates")
    education: str = Field(description="Education details with schools, degrees, dates")
    projects: str = Field(description="Project details with names, technologies, descriptions")

class ResumeResponse(BaseModel):
    id: int
    student_id: int
    skills: str
    achievements: str
    certifications: str
    hobbies: str
    experience: str
    education: str
    projects: str