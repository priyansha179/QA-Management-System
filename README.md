# QA Management System

A web-based Quality Assurance Management System designed to help QA teams organize software testing activities, manage test cases, execute tests, and track software defects.

This project is currently in development. The initial backend includes user registration, login, and a health-check API. Additional QA management features are planned.

## Project Overview

The goal of this project is to build a centralized platform for managing software testing workflows. It will eventually support testers, developers, and administrators in organizing projects, managing test cases, recording execution results, and tracking bugs.

The project is also a practical learning initiative focused on full-stack development, REST API development, database management, and software testing.

## Current Features

The following features are currently implemented:

- **Health Check:** Verify whether the backend API is running.
- **User Registration:** Register a user with an email, password, and role.
- **User Login:** Validate user credentials.
- **Password Hashing:** Hash passwords before storing them in the database.
- **User Roles:** Store a user's role, with Tester as the default role.
- **Database Integration:** Store user information using SQLite and SQLAlchemy.

## Planned Features

The following features are part of the development roadmap and are not implemented yet:

- Project creation and management.
- Test case creation, editing, and organization.
- Test execution and result tracking.
- Bug reporting and defect management.
- Bug severity and priority management.
- Dashboard and testing analytics.
- Search and filtering.
- Role-based permissions.
- Frontend integration.

## Technology Stack

| Category | Technology |
|---|---|
| Backend | Python, FastAPI |
| Database | SQLite |
| ORM | SQLAlchemy |
| Data Validation | Pydantic |
| Server | Uvicorn |
| API Documentation | FastAPI Swagger UI |
| Version Control | Git and GitHub |

**Planned technologies**

- Frontend: React.js
- Styling: Tailwind CSS
- API Testing: Postman
- Automation Testing: Playwright

## System Architecture

The current application consists of a FastAPI backend connected to an SQLite database through SQLAlchemy.

**Current flow:** FastAPI Backend → SQLAlchemy → SQLite Database

A React frontend is planned for a future development phase.

## Project Structure

```text
QA-Management-System/
│
├── backend/
│   ├── __pycache__/       # Generated Python cache files
│   ├── database.py        # SQLite connection and SQLAlchemy setup
│   ├── main.py            # FastAPI application and API endpoints
│   ├── models.py          # Database models
│   ├── qa_system.db       # SQLite database
│   └── requirements.txt  # Python dependencies
│
└── README.md
```

## Backend Files

| File | Description |
|---|---|
| `main.py` | Creates the FastAPI application and defines API endpoints. |
| `database.py` | Configures the SQLite database connection and SQLAlchemy session. |
| `models.py` | Defines the User database model. |
| `requirements.txt` | Lists the Python dependencies. |
| `qa_system.db` | SQLite database file. |

## Getting Started

Follow these instructions to run the current backend locally.

### Prerequisites

- Python installed
- Git installed
- A code editor such as VS Code

### 1. Clone the Repository

```bash
git clone https://github.com/priyansha179/QA-Management-System.git
cd QA-Management-System
```

### 2. Navigate to the Backend

```bash
cd backend
```

### 3. Create a Virtual Environment

```bash
python -m venv venv
```

Activate it:

**Windows:**

```bash
venv\\Scripts\\activate
```

**Linux/macOS:**

```bash
source venv/bin/activate
```

### 4. Install Dependencies

```bash
python -m pip install -r requirements.txt
```

### 5. Run the Backend Server

Run this command from inside the `backend` directory:

```bash
uvicorn main:app --reload
```

The API will be available at:

```
http://127.0.0.1:8000
```

## API Endpoints

The current backend provides the following endpoints:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Checks API availability. |
| POST | `/register` | Registers a new user. |
| POST | `/login` | Authenticates a user. |

### 1. Health Check

**Request**

```http
GET /health
```

**Example response**

```json
{
  "status": "ok",
  "message": "API is running!"
}
```

### 2. User Registration

**Request**

```http
POST /register
```

**Example request body**

```json
{
  "email": "tester@example.com",
  "password": "your_password",
  "role": "Tester"
}
```

A successful registration returns a confirmation message and the new user's ID. Registering an email that already exists returns an error.

### 3. User Login

**Request**

```http
POST /login
```

**Example request body**

```json
{
  "email": "tester@example.com",
  "password": "your_password"
}
```

A successful login returns a confirmation message and the user's role. Invalid credentials return an authentication error.

## API Documentation

FastAPI automatically generates interactive API documentation.

After starting the backend, visit:

- **Swagger UI:** http://127.0.0.1:8000/docs
- **ReDoc:** http://127.0.0.1:8000/redoc

You can use Swagger UI to send requests and inspect API responses.

## Security Note

The current implementation uses SHA-256 for password hashing and does not yet issue JWT access tokens. This is an early learning implementation, not production-ready authentication. A password-specific hashing algorithm and a secure authentication flow are planned improvements.

## Development Roadmap

- [x] Initialize FastAPI backend.
- [x] Configure SQLite database using SQLAlchemy.
- [x] Create the User database model.
- [x] Implement health-check endpoint.
- [x] Implement user registration.
- [x] Implement user login.
- [ ] Improve password security.
- [ ] Implement JWT authentication.
- [ ] Add role-based authorization.
- [ ] Design and build the React frontend.
- [ ] Implement project management.
- [ ] Implement test case management.
- [ ] Implement test execution.
- [ ] Implement bug tracking.
- [ ] Build dashboard and analytics.
- [ ] Perform API testing using Postman.
- [ ] Add end-to-end automation using Playwright.
- [ ] Deploy the application.

## Testing Strategy

Testing will be introduced as the application develops.

**Planned manual testing:**
- Functional Testing
- Integration Testing
- System Testing
- Regression Testing
- Smoke Testing
- Sanity Testing
- Exploratory Testing
- Usability Testing
- Compatibility Testing
- Negative Testing

**Planned API testing:**
- Validate API responses and status codes.
- Test valid and invalid inputs.
- Verify registration and login behavior.
- Test error handling.

**Planned automation testing:**
- Automate important user workflows using Playwright.
- Validate frontend and backend integration.

## Learning Objectives

Through this project, I aim to gain practical experience in:

- Full-stack web application development.
- Python and FastAPI.
- REST API development.
- Database management and SQL.
- Authentication and authorization.
- Software Quality Assurance.
- API testing and automation.
- Git and GitHub workflows.

## Project Status

**Status: In Progress**

The initial backend setup, database connection, user model, registration, and login endpoints are implemented. Frontend development and the remaining QA management modules are planned.

---

Developed as a hands-on learning project.
