import os
from datetime import datetime
from typing import Literal

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

import models
from auth import (
    create_access_token,
    get_current_user,
    hash_password,
    is_legacy_password_hash,
    verify_password,
)
from database import Base, SessionLocal, engine


def migrate_existing_database() -> None:
    """
    Add columns introduced after the first database version.
    Existing users and projects are kept. Old projects have no known owner,
    so owner_id stays NULL for those records.
    """
    inspector = inspect(engine)
    if "projects" not in inspector.get_table_names():
        return

    existing_columns = {
        column["name"] for column in inspector.get_columns("projects")
    }

    with engine.begin() as connection:
        if "owner_id" not in existing_columns:
            connection.execute(
                text(
                    "ALTER TABLE projects "
                    "ADD COLUMN owner_id INTEGER REFERENCES users(id)"
                )
            )

        if "created_at" not in existing_columns:
            connection.execute(
                text("ALTER TABLE projects ADD COLUMN created_at DATETIME")
            )

        connection.execute(
            text(
                "UPDATE projects SET created_at = CURRENT_TIMESTAMP "
                "WHERE created_at IS NULL"
            )
        )


# Create missing tables first, then safely upgrade an existing projects table.
Base.metadata.create_all(bind=engine)
migrate_existing_database()

app = FastAPI(
    title="QA Management System",
    description="Backend API for managing QA projects.",
    version="1.0.0",
)

# Allow the Vite development server and configured frontend origins to call the API.
frontend_origins = os.getenv(
    "FRONTEND_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in frontend_origins if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_authenticated_user(
    email: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with this token no longer exists",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


# Request and response schemas
class UserCreate(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=8, max_length=72)


class UserLogin(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    description: str | None = None
    status: Literal["Active", "Completed", "On Hold"] = "Active"


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=150)
    description: str | None = None
    status: Literal["Active", "Completed", "On Hold"] | None = None


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    status: str
    owner_id: int | None
    created_at: datetime


class TestCaseCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    preconditions: str | None = None
    steps: str = Field(min_length=1)
    expected_result: str = Field(min_length=1)
    priority: Literal["Low", "Medium", "High", "Critical"] = "Medium"
    status: Literal["Draft", "Ready"] = "Draft"


class TestCaseUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    preconditions: str | None = None
    steps: str | None = Field(default=None, min_length=1)
    expected_result: str | None = Field(default=None, min_length=1)
    priority: Literal["Low", "Medium", "High", "Critical"] | None = None
    status: Literal["Draft", "Ready"] | None = None


class TestCaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    title: str
    description: str | None
    preconditions: str | None
    steps: str
    expected_result: str
    priority: str
    status: str
    created_at: datetime


@app.get("/health")
def health_check():
    return {"status": "ok", "message": "API is running!"}


@app.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = (
        db.query(models.User)
        .filter(models.User.email == user.email)
        .first()
    )
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    new_user = models.User(
        email=user.email,
        hashed_password=hash_password(user.password),
        role="Tester",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created successfully",
        "user_id": new_user.id,
        "role": new_user.role,
    }


@app.post("/login", response_model=TokenResponse)
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = (
        db.query(models.User)
        .filter(models.User.email == user.email)
        .first()
    )

    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Upgrade old SHA-256 hashes after a successful login.
    if is_legacy_password_hash(db_user.hashed_password):
        db_user.hashed_password = hash_password(user.password)
        db.commit()

    access_token = create_access_token(data={"sub": db_user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": db_user.role,
    }


@app.post(
    "/projects",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_authenticated_user),
):
    new_project = models.Project(
        name=project.name,
        description=project.description,
        status=project.status,
        owner_id=current_user.id,
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project


@app.get("/projects", response_model=list[ProjectResponse])
def list_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_authenticated_user),
):
    return (
        db.query(models.Project)
        .filter(models.Project.owner_id == current_user.id)
        .order_by(models.Project.created_at.desc())
        .all()
    )


@app.get("/projects/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_authenticated_user),
):
    project = (
        db.query(models.Project)
        .filter(
            models.Project.id == project_id,
            models.Project.owner_id == current_user.id,
        )
        .first()
    )
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return project


@app.put("/projects/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_authenticated_user),
):
    project = (
        db.query(models.Project)
        .filter(
            models.Project.id == project_id,
            models.Project.owner_id == current_user.id,
        )
        .first()
    )
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    updates = project_data.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)
    return project


@app.delete("/projects/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_authenticated_user),
):
    project = (
        db.query(models.Project)
        .filter(
            models.Project.id == project_id,
            models.Project.owner_id == current_user.id,
        )
        .first()
    )
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    db.query(models.TestCase).filter(
        models.TestCase.project_id == project.id
    ).delete(synchronize_session=False)
    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}



def get_owned_project(
    project_id: int,
    db: Session,
    current_user: models.User,
):
    project = (
        db.query(models.Project)
        .filter(
            models.Project.id == project_id,
            models.Project.owner_id == current_user.id,
        )
        .first()
    )
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return project


def get_owned_test_case(
    test_case_id: int,
    db: Session,
    current_user: models.User,
):
    test_case = (
        db.query(models.TestCase)
        .join(models.Project, models.TestCase.project_id == models.Project.id)
        .filter(
            models.TestCase.id == test_case_id,
            models.Project.owner_id == current_user.id,
        )
        .first()
    )
    if test_case is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test case not found",
        )
    return test_case


@app.post(
    "/projects/{project_id}/test-cases",
    response_model=TestCaseResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_test_case(
    project_id: int,
    test_case_data: TestCaseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_authenticated_user),
):
    get_owned_project(project_id, db, current_user)
    test_case = models.TestCase(
        project_id=project_id,
        **test_case_data.model_dump(),
    )
    db.add(test_case)
    db.commit()
    db.refresh(test_case)
    return test_case


@app.get(
    "/projects/{project_id}/test-cases",
    response_model=list[TestCaseResponse],
)
def list_test_cases(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_authenticated_user),
):
    get_owned_project(project_id, db, current_user)
    return (
        db.query(models.TestCase)
        .filter(models.TestCase.project_id == project_id)
        .order_by(models.TestCase.created_at.desc())
        .all()
    )


@app.get("/test-cases/{test_case_id}", response_model=TestCaseResponse)
def get_test_case(
    test_case_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_authenticated_user),
):
    return get_owned_test_case(test_case_id, db, current_user)


@app.put("/test-cases/{test_case_id}", response_model=TestCaseResponse)
def update_test_case(
    test_case_id: int,
    test_case_data: TestCaseUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_authenticated_user),
):
    test_case = get_owned_test_case(test_case_id, db, current_user)
    updates = test_case_data.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(test_case, field, value)
    db.commit()
    db.refresh(test_case)
    return test_case


@app.delete("/test-cases/{test_case_id}")
def delete_test_case(
    test_case_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_authenticated_user),
):
    test_case = get_owned_test_case(test_case_id, db, current_user)
    db.delete(test_case)
    db.commit()
    return {"message": "Test case deleted successfully"}
