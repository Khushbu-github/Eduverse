# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.orm import Session
# from datetime import timedelta
# import logging
# import os
# from dotenv import load_dotenv
# from models import User, Student, Teacher, Hod
# from schemas import UserCreate, UserLogin, Token
# from auth import hash_password, verify_password, create_access_token
# from database import get_db

# # Load environment variables
# load_dotenv()

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# router = APIRouter(prefix="/auth", tags=["auth"])

# # Environment variables
# ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# # ========================
# # REGISTRATION ROUTES
# # ========================

# @router.post("/register", response_model=Token)
# async def register(user: UserCreate, db: Session = Depends(get_db)):
#     """
#     Register a new user and return a JWT access token.
    
#     Args:
#         user: UserCreate schema with name, email, password, and optional role
#         db: SQLAlchemy database session
    
#     Raises:
#         HTTPException: If email is already registered or role is invalid
#     """
#     try:
#         # Check for existing user
#         if db.query(User).filter(User.email == user.email).first():
#             logger.warning(f"Registration attempt with already used email: {user.email}")
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="Email already registered"
#             )
        
#         # Validate role (must be 'student', 'teacher', or 'hod')
#         valid_roles = ["student", "teacher", "hod"]
#         user_role = user.role if user.role else "student"  # Default to student
#         if user_role not in valid_roles:
#             logger.error(f"Invalid role provided: {user_role}")
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail=f"Role must be one of {valid_roles}"
#             )
        
#         # Hash password
#         hashed_password = hash_password(user.password)
        
#         # Create appropriate user type based on role
#         if user_role == "student":
#             # For student, we need USN which should be provided via StudentCreate
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="Use /students/register endpoint for student registration"
#             )
#         elif user_role == "teacher":
#             db_user = Teacher(
#                 name=user.name,
#                 email=user.email,
#                 password=hashed_password,
#                 type="teacher"
#             )
#         elif user_role == "hod":
#             db_user = Hod(
#                 name=user.name,
#                 email=user.email,
#                 password=hashed_password,
#                 type="hod"
#             )
#         else:
#             # Fallback to base User
#             db_user = User(
#                 name=user.name,
#                 email=user.email,
#                 password=hashed_password,
#                 type=user_role
#             )
        
#         db.add(db_user)
#         db.commit()
#         db.refresh(db_user)
        
#         # Generate JWT token
#         access_token = create_access_token(
#             data={"sub": db_user.email, "role": db_user.type},
#             expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
#         )
        
#         logger.info(f"User registered successfully: {db_user.email} as {db_user.type}")
#         return {
#             "access_token": access_token,
#             "token_type": "bearer",
#             "user_role": db_user.type,
#             "user_id": db_user.id
#         }
    
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Registration failed: {str(e)}")
#         db.rollback()
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="Registration failed"
#         )

# # ========================
# # LOGIN ROUTES
# # ========================

# @router.post("/login", response_model=Token)
# async def login(user: UserLogin, db: Session = Depends(get_db)):
#     """
#     Authenticate a user and return a JWT access token.
#     This endpoint tries to find the user in all role-specific tables.
    
#     Args:
#         user: UserLogin schema with email and password
#         db: SQLAlchemy database session
    
#     Raises:
#         HTTPException: If credentials are invalid
#     """
#     try:
#         db_user = None
#         user_role = None
        
#         # Try to find user in Student table
#         db_user = db.query(Student).filter(Student.email == user.email).first()
#         if db_user:
#             user_role = "student"
        
#         # If not found, try Teacher table
#         if not db_user:
#             db_user = db.query(Teacher).filter(Teacher.email == user.email).first()
#             if db_user:
#                 user_role = "teacher"
        
#         # If not found, try HOD table
#         if not db_user:
#             db_user = db.query(Hod).filter(Hod.email == user.email).first()
#             if db_user:
#                 user_role = "hod"
        
#         # If still not found, try base User table (fallback)
#         if not db_user:
#             db_user = db.query(User).filter(User.email == user.email).first()
#             if db_user:
#                 user_role = db_user.type
        
#         # Check if user exists and password is correct
#         if not db_user or not verify_password(user.password, db_user.password):
#             logger.warning(f"Login attempt failed for email: {user.email}")
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Invalid credentials",
#                 headers={"WWW-Authenticate": "Bearer"}
#             )
        
#         # Generate access token
#         access_token = create_access_token(
#             data={"sub": db_user.email, "role": user_role},
#             expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
#         )
        
#         logger.info(f"User logged in successfully: {db_user.email} as {user_role}")
#         return {
#             "access_token": access_token,
#             "token_type": "bearer",
#             "user_role": user_role,
#             "user_id": db_user.id
#         }
    
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Login failed: {str(e)}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="Login failed"
#         )

# # ========================
# # ROLE-SPECIFIC LOGIN ROUTES
# # ========================

# @router.post("/login/student", response_model=Token)
# async def student_login(user: UserLogin, db: Session = Depends(get_db)):
#     """Student-specific login endpoint"""
#     try:
#         db_user = db.query(Student).filter(Student.email == user.email).first()
#         if not db_user or not verify_password(user.password, db_user.password):
#             logger.warning(f"Student login attempt failed for email: {user.email}")
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Invalid student credentials",
#                 headers={"WWW-Authenticate": "Bearer"}
#             )
        
#         access_token = create_access_token(
#             data={"sub": db_user.email, "role": "student"},
#             expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
#         )
        
#         logger.info(f"Student logged in successfully: {db_user.email}")
#         return {
#             "access_token": access_token,
#             "token_type": "bearer",
#             "user_role": "student",
#             "user_id": db_user.id
#         }
    
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Student login failed: {str(e)}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="Student login failed"
#         )

# @router.post("/login/teacher", response_model=Token)
# async def teacher_login(user: UserLogin, db: Session = Depends(get_db)):
#     """Teacher-specific login endpoint"""
#     try:
#         db_user = db.query(Teacher).filter(Teacher.email == user.email).first()
#         if not db_user or not verify_password(user.password, db_user.password):
#             logger.warning(f"Teacher login attempt failed for email: {user.email}")
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Invalid teacher credentials",
#                 headers={"WWW-Authenticate": "Bearer"}
#             )
        
#         access_token = create_access_token(
#             data={"sub": db_user.email, "role": "teacher"},
#             expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
#         )
        
#         logger.info(f"Teacher logged in successfully: {db_user.email}")
#         return {
#             "access_token": access_token,
#             "token_type": "bearer",
#             "user_role": "teacher",
#             "user_id": db_user.id
#         }
    
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Teacher login failed: {str(e)}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="Teacher login failed"
#         )

# @router.post("/login/hod", response_model=Token)
# async def hod_login(user: UserLogin, db: Session = Depends(get_db)):
#     """HOD-specific login endpoint"""
#     try:
#         db_user = db.query(Hod).filter(Hod.email == user.email).first()
#         if not db_user or not verify_password(user.password, db_user.password):
#             logger.warning(f"HOD login attempt failed for email: {user.email}")
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Invalid HOD credentials",
#                 headers={"WWW-Authenticate": "Bearer"}
#             )
        
#         access_token = create_access_token(
#             data={"sub": db_user.email, "role": "hod"},
#             expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
#         )
        
#         logger.info(f"HOD logged in successfully: {db_user.email}")
#         return {
#             "access_token": access_token,
#             "token_type": "bearer",
#             "user_role": "hod",
#             "user_id": db_user.id
#         }
    
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"HOD login failed: {str(e)}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="HOD login failed"
#         )

# # ========================
# # TOKEN VALIDATION ROUTES
# # ========================

# @router.post("/verify-token")
# async def verify_token_endpoint(token: str, db: Session = Depends(get_db)):
#     """Verify if a token is valid and return user info"""
#     try:
#         from auth import verify_token
#         email = verify_token(token)
        
#         if email is None:
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Invalid or expired token"
#             )
        
#         user = db.query(User).filter(User.email == email).first()
#         if not user:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="User not found"
#             )
        
#         return {
#             "valid": True,
#             "user_id": user.id,
#             "email": user.email,
#             "role": user.type,
#             "name": user.name
#         }
    
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Token verification failed: {str(e)}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="Token verification failed"
#         )

# @router.post("/refresh-token", response_model=Token)
# async def refresh_token(token: str, db: Session = Depends(get_db)):
#     """Refresh an existing token"""
#     try:
#         from auth import verify_token
#         email = verify_token(token)
        
#         if email is None:
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Invalid or expired token"
#             )
        
#         user = db.query(User).filter(User.email == email).first()
#         if not user:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="User not found"
#             )
        
#         # Generate new token
#         new_access_token = create_access_token(
#             data={"sub": user.email, "role": user.type},
#             expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
#         )
        
#         logger.info(f"Token refreshed for user: {user.email}")
#         return {
#             "access_token": new_access_token,
#             "token_type": "bearer",
#             "user_role": user.type,
#             "user_id": user.id
#         }
    
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Token refresh failed: {str(e)}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="Token refresh failed"
#         )

# # ========================
# # LOGOUT ROUTE
# # ========================

# @router.post("/logout")
# async def logout():
#     """
#     Logout endpoint - since JWT is stateless, this mainly serves as a client-side indication.
#     The client should remove the token from storage.
#     """
#     logger.info("User logout requested")
#     return {"message": "Successfully logged out. Please remove token from client storage."}

# # ========================
# # PASSWORD RESET (Basic Implementation)
# # ========================

# @router.post("/forgot-password")
# async def forgot_password(email: str, db: Session = Depends(get_db)):
#     """
#     Basic forgot password implementation - in production, this should send an email
#     """
#     try:
#         user = db.query(User).filter(User.email == email).first()
#         if not user:
#             # Don't reveal if email exists or not for security
#             return {"message": "If the email exists, a reset link has been sent"}
        
#         # In production, generate a reset token and send email
#         # For now, just log it
#         logger.info(f"Password reset requested for: {email}")
        
#         return {"message": "If the email exists, a reset link has been sent"}
    
#     except Exception as e:
#         logger.error(f"Password reset request failed: {str(e)}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="Password reset request failed"
#         )
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import logging
import os
from dotenv import load_dotenv
from models import User, Student, Teacher, Hod
from schemas import UserCreate, UserLogin, Token
from auth import (
    hash_password, 
    verify_password, 
    create_access_token, 
    get_current_user,
    oauth2_scheme
)
from database import get_db
load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
def find_user_by_email(email: str, db: Session):
    """
    Find user in all tables and return user object and role
    """
    db_user = db.query(Student).filter(Student.email == email).first()
    if db_user:
        return db_user, "student"
    db_user = db.query(Teacher).filter(Teacher.email == email).first()
    if db_user:
        return db_user, "teacher"
    db_user = db.query(Hod).filter(Hod.email == email).first()
    if db_user:
        return db_user, "hod"
    db_user = db.query(User).filter(User.email == email).first()
    if db_user:
        return db_user, getattr(db_user, 'type', 'user')
    return None, None
@router.post("/token", response_model=Token, summary="Login for Access Token", description="OAuth2 compatible token login, used by Swagger UI for authorization")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token login for Swagger UI authorization.
    
    **How to use in Swagger UI:**
    1. Click the "Authorize" button (🔒 icon)
    2. Enter your email as 'username'
    3. Enter your password
    4. Leave client_id and client_secret empty
    5. Click "Authorize"
    
    **For React/Frontend:**
    Use form data format:
    ```
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    ```
    """
    try:
        logger.info(f"Token login attempt for: {form_data.username}")
        db_user, user_role = find_user_by_email(form_data.username, db)
        
        if not db_user:
            logger.warning(f"No user found with email: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not verify_password(form_data.password, db_user.password):
            logger.warning(f"Password verification failed for: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        logger.info(f"Authentication successful for: {form_data.username} as {user_role}")
        access_token = create_access_token(
            data={
                "sub": db_user.email, 
                "role": user_role,
                "user_id": str(db_user.id),
                "name": db_user.name
            },
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        logger.info(f"Token generated successfully for: {db_user.email}")
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_role": user_role,
            "user_id": db_user.id,
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60  # seconds
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token generation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service temporarily unavailable"
        )

@router.get("/me", summary="Get Current User", description="Get current user information (requires authentication)")
async def read_users_me(current_user_data = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get current user information. 
    
    **This endpoint requires authentication.**
    
    **Test in Swagger UI:**
    1. First login using the /auth/token endpoint or the Authorize button
    2. Then call this endpoint - it should return your user data
    """
    try:
        email = current_user_data["email"]
        role = current_user_data["role"]
        
        logger.info(f"Getting user info for: {email} with role: {role}")
        db_user, _ = find_user_by_email(email, db)
        
        if not db_user:
            logger.error(f"User not found in database: {email}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="User not found"
            )
        
        return {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "role": role,
            "created_at": getattr(db_user, 'created_at', None),
            "is_active": getattr(db_user, 'is_active', True)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user info: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving user information"
        )

@router.get("/protected", summary="Test Protected Endpoint", description="A simple protected endpoint for testing authentication")
async def protected_route(current_user_data = Depends(get_current_user)):
    """
    A simple protected endpoint for testing authentication.
    Try this after authorizing in Swagger UI!
    """
    return {
        "message": "Hello! This is a protected endpoint.",
        "user": current_user_data["email"],
        "role": current_user_data["role"],
        "timestamp": "2024-01-01T00:00:00Z"
    }
@router.post("/login", response_model=Token, summary="Login (JSON Format)", description="Login using JSON format (recommended for frontend applications)")
async def login(user: UserLogin, db: Session = Depends(get_db)):
    """
    Login using JSON format (recommended for React/frontend applications).
    
    **Example request body:**
    ```json
    {
        "email": "user@example.com",
        "password": "yourpassword"
    }
    ```
    """
    try:
        logger.info(f"JSON login attempt for: {user.email}")
        db_user, user_role = find_user_by_email(user.email, db)
        
        if not db_user or not verify_password(user.password, db_user.password):
            logger.warning(f"Login failed for email: {user.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"}
            )
        access_token = create_access_token(
            data={
                "sub": db_user.email, 
                "role": user_role,
                "user_id": str(db_user.id),
                "name": db_user.name
            },
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        logger.info(f"JSON login successful for: {db_user.email} as {user_role}")
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_role": user_role,
            "user_id": db_user.id,
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"JSON login failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login service temporarily unavailable"
        )
@router.post("/register", response_model=Token, summary="Register New User", description="Register a new user account")
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user and return an access token.
    
    **Note:** Students should use the dedicated student registration endpoint 
    if additional fields like USN are required.
    """
    try:
        existing_user, _ = find_user_by_email(user.email, db)
        if existing_user:
            logger.warning(f"Registration attempt with existing email: {user.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        valid_roles = ["student", "teacher", "hod"]
        user_role = user.role if user.role else "student"
        if user_role not in valid_roles:
            logger.error(f"Invalid role provided: {user_role}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Role must be one of {valid_roles}"
            )
        hashed_password = hash_password(user.password)
        if user_role == "teacher":
            db_user = Teacher(
                name=user.name,
                email=user.email,
                password=hashed_password,
                type="teacher"
            )
        elif user_role == "hod":
            db_user = Hod(
                name=user.name,
                email=user.email,
                password=hashed_password,
                type="hod"
            )
        elif user_role == "student":
            db_user = Student(
                name=user.name,
                email=user.email,
                password=hashed_password,
                type="student",
                usn=f"TEMP_{user.email.split('@')[0]}"
            )
        else:
            db_user = User(
                name=user.name,
                email=user.email,
                password=hashed_password,
                type=user_role
            )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        access_token = create_access_token(
            data={
                "sub": db_user.email, 
                "role": user_role,
                "user_id": str(db_user.id),
                "name": db_user.name
            },
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        logger.info(f"User registered successfully: {db_user.email} as {user_role}")
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_role": user_role,
            "user_id": db_user.id,
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration failed: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration service temporarily unavailable"
        )
@router.post("/logout", summary="Logout", description="Logout (clears client-side token)")
async def logout():
    """
    Logout endpoint. Since JWT tokens are stateless, this mainly serves 
    as a client-side indication. The client should remove the token from storage.
    """
    logger.info("User logout requested")
    return {
        "message": "Successfully logged out. Please remove token from client storage.",
        "instructions": [
            "Remove 'access_token' from localStorage",
            "Clear any user session data",
            "Redirect to login page"
        ]
    }

@router.get("/health", summary="Health Check", description="Check if auth service is working")
async def auth_health_check():
    """Simple health check endpoint"""
    return {
        "status": "healthy",
        "service": "authentication",
        "timestamp": "2024-01-01T00:00:00Z"
    }
@router.post("/verify", summary="Verify Token", description="Verify if a token is valid")
async def verify_token_endpoint(current_user_data = Depends(get_current_user)):
    """
    Verify if the provided token is valid and return user info.
    Send token in Authorization header: "Bearer <your_token>"
    """
    return {
        "valid": True,
        "user": current_user_data,
        "message": "Token is valid"
    }