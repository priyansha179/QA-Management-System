from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="Tester", nullable=False)


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(String(30), default="Active", nullable=False)

    # Nullable so projects created by the older version of the app remain readable.
    # New projects always receive the authenticated user's ID.
    owner_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(
        Integer,
        ForeignKey("projects.id"),
        nullable=False,
        index=True,
    )
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    preconditions = Column(Text, nullable=True)
    steps = Column(Text, nullable=False)
    expected_result = Column(Text, nullable=False)
    priority = Column(String(20), default="Medium", nullable=False)
    status = Column(String(20), default="Draft", nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
