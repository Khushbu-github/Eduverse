from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

# OAuth2 scheme for Swagger UI - IMPORTANT: This must match your token endpoint path
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="auth/token",  # This points to /auth/token endpoint
    description="JWT Bearer Authentication"
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production-please-use-a-strong-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    """Verify JWT token and return email"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        return email
    except JWTError as e:
        logger.error(f"Token verification failed: {str(e)}")
        return None

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode the JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        
        if email is None:
            logger.error("Token payload missing 'sub' (email)")
            raise credentials_exception
            
        logger.info(f"Token validated for user: {email} with role: {role}")
        return {"email": email, "role": role}
        
    except JWTError as e:
        logger.error(f"JWT validation failed: {str(e)}")
        raise credentials_exception

# Role-based dependencies
async def get_current_student(current_user = Depends(get_current_user)):
    """Ensure current user is a student"""
    if current_user.get("role") != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Student role required."
        )
    return current_user

async def get_current_teacher(current_user = Depends(get_current_user)):
    """Ensure current user is a teacher"""
    if current_user.get("role") != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Teacher role required."
        )
    return current_user

async def get_current_hod(current_user = Depends(get_current_user)):
    """Ensure current user is an HOD"""
    if current_user.get("role") != "hod":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. HOD role required."
        )
    return current_user

async def get_teacher_or_hod(current_user = Depends(get_current_user)):
    """Ensure current user is either a teacher or HOD"""
    if current_user.get("role") not in ["teacher", "hod"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Teacher or HOD role required."
        )
    return current_user