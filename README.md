# 🎓 Student Analysis System

A **FastAPI-based backend** for managing students, teachers, and HODs.  
The system supports student registration, AI-powered resume parsing, marks tracking across semesters, skill/portfolio updates, and teacher/HOD monitoring.

---

## 🚀 Features

### 👩‍🎓 Student
- Register with personal details.
- Upload **resume** → AI scrapes and analyzes details → structured JSON stored.
- Update marks:
  - Add new semester marks.
  - Update existing marks.
- Update additional details:
  - LeetCode profile URL.
  - GitHub profile URL.
  - Extra skills / achievements.
- Update assigned **teacher** (mentor).

### 👩‍🏫 Teacher
- Monitor students assigned to them.
- Access student details, marks, resume analysis, and profiles.

### 🎓 HOD
- Access **all students** in the department.
- View consolidated analysis for performance monitoring.

---

## 🏗️ Tech Stack

- **Backend:** [FastAPI](https://fastapi.tiangolo.com/)  
- **Database ORM:** [SQLAlchemy](https://www.sqlalchemy.org/)  
- **Database:** SQLite (dev), PostgreSQL/MySQL (prod)  
- **Environment Management:** [python-dotenv](https://pypi.org/project/python-dotenv/)  
- **AI Resume Analysis:** (Pluggable via API, e.g., OpenAI/Groq/LangChain pipeline)
- ✅ To Do
 Authentication with JWT
 Role-based permissions
 AI integration for resume analysis
 Admin dashboards with charts
