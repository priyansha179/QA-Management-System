from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# This creates a file called qa_system.db in your backend folder
SQLALCHEMY_DATABASE_URL = "sqlite:///./qa_system.db"

# check_same_thread=False is needed only for SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()