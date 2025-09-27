from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    type = Column(String)  # discriminator column

    __mapper_args__ = {
        "polymorphic_identity": "user",
        "polymorphic_on": type
    }
class Student(User):
    __tablename__ = "students"

    id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    usn = Column(String(20), unique=True, index=True, nullable=False)
    leetcodeurl = Column(String(255))
    githuburl = Column(String(255))

    teacher_id = Column(Integer, ForeignKey("users.id"), index=True)

    # Many students → one teacher
    teacher = relationship(
        "Teacher",
        back_populates="students",
        foreign_keys=[teacher_id]
    )

    # Add missing relationships for related tables
    semester = relationship("Semester", back_populates="student", uselist=False)
    marks = relationship("Marks", back_populates="student", uselist=False)
    questions = relationship("Questions", back_populates="student", uselist=False)
    resume = relationship("Resume", back_populates="student", uselist=False)
    interests = relationship("Interest", back_populates="student")

    __mapper_args__ = {
        "polymorphic_identity": "student",
        "inherit_condition": id == User.id
    }


# ======================
# Teacher Inherits User
# ======================
class Teacher(User):
    __tablename__ = "teachers"

    id = Column(Integer, ForeignKey("users.id"), primary_key=True)

    # One teacher → many students
    students = relationship(
        "Student",
        back_populates="teacher",
        foreign_keys="Student.teacher_id"
    )

    __mapper_args__ = {
        "polymorphic_identity": "teacher",
        "inherit_condition": id == User.id
    }


# ======================
# Hod Inherits User
# ======================
class Hod(User):
    __tablename__ = "hods"

    id = Column(Integer, ForeignKey("users.id"), primary_key=True)

    __mapper_args__ = {
        "polymorphic_identity": "hod",
        "inherit_condition": id == User.id
    }


# ======================
# Related Tables
# ======================
class Semester(Base):
    __tablename__ = "semesters"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    current_semester = Column(Integer)

    student = relationship("Student", back_populates="semester")


class Marks(Base):
    __tablename__ = "marks"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    
    # These field names MUST match what you're sending in the API
    sem1_marks = Column(Float, nullable=True)
    sem2_marks = Column(Float, nullable=True) 
    sem3_marks = Column(Float, nullable=True)
    sem4_marks = Column(Float, nullable=True)
    sem5_marks = Column(Float, nullable=True)
    sem6_marks = Column(Float, nullable=True)
    sem7_marks = Column(Float, nullable=True)
    sem8_marks = Column(Float, nullable=True)
    
    # Relationship
    student = relationship("Student", back_populates="marks")


class Questions(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    question1 = Column(Text)
    answer1 = Column(Text)
    question2 = Column(Text)
    answer2 = Column(Text)
    question3 = Column(Text)
    answer3 = Column(Text)
    question4 = Column(Text)
    answer4 = Column(Text)
    question5 = Column(Text)
    answer5 = Column(Text)

    student = relationship("Student", back_populates="questions")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id"))

    skills = Column(Text)
    achievements = Column(Text)
    certifications = Column(Text)
    hobbies = Column(Text)
    experience = Column(Text)
    education = Column(Text)
    projects = Column(Text)
    resume_file_path = Column(String(500))  # Store file path

    student = relationship("Student", back_populates="resume")


class Interest(Base):
    __tablename__ = "interests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    category = Column(String)
    activity = Column(String)
    level = Column(String)
    achievements = Column(Text)

    student = relationship("Student", back_populates="interests")