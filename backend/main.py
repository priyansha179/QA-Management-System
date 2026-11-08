from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import hashlib

# Import our local files
import models
from database import engine, SessionLocal

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="QA Management System")

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- PYDANTIC SCHEMAS (Data Validation) ---
class UserCreate(BaseModel):
    email: str
    password: str
    role: str = "Tester"

class UserLogin(BaseModel):
    email: str
    password: str

# Helper function to hash passwords securely
def hash_password(password: str):
    return hashlib.sha256(password.encode()).hexdigest()

# --- ENDPOINTS ---

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "API is running!"}

@app.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # 1. Check if user already exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 2. Hash the password and save the user
    hashed_pw = hash_password(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_pw, role=user.role)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "User created successfully", "user_id": new_user.id}

@app.post("/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    # 1. Find the user by email
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    
    # 2. Check if user exists and password is correct
    if not db_user or db_user.hashed_password != hash_password(user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # 3. Return success
    return {"message": "Login successful", "role": db_user.role}