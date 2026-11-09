# QA Management System

A backend-first Quality Assurance Management System built with FastAPI and SQLite. The project is being developed to help QA teams organize projects and, in future stages, manage test cases, test execution, and defects.

## Current Features

- User registration and login.
- JWT access-token generation and verification.
- Protected project management endpoints.
- Users can create, list, view, and delete their own projects.
- Bcrypt password hashing for new registrations.
- Automatic upgrade of existing SHA-256 password hashes to bcrypt after a successful login.
- SQLite database integration through SQLAlchemy.
- Interactive API documentation with Swagger UI.

## Technology Stack

| Category | Technology |
|---|---|
| Language | Python |
| Backend framework | FastAPI |
| Database | SQLite |
| ORM | SQLAlchemy |
| Authentication | JWT (python-jose) |
| Password hashing | Passlib and bcrypt |
| API server | Uvicorn |
| API documentation | Swagger UI / ReDoc |

## Project Structure

```text
QA-Management-System/
├── backend/
│   ├── auth.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   └── requirements.txt
└── README.md
```

The SQLite database file (`qa_system.db`) is created in the backend directory when the application runs.

## Getting Started

### Prerequisites

- Python 3.10 or newer
- Git
- VS Code or another code editor

### 1. Clone the repository

```bash
git clone https://github.com/priyansha179/QA-Management-System.git
cd QA-Management-System
```

### 2. Create and activate a virtual environment

Run these commands from the repository root:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

For macOS/Linux:

```bash
python -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
cd backend
python -m pip install -r requirements.txt
```

### 4. Set a JWT secret key

For the current PowerShell terminal, set a development secret before starting the server:

```powershell
$env:JWT_SECRET_KEY = "replace-this-with-a-long-random-secret"
```

For macOS/Linux:

```bash
export JWT_SECRET_KEY="replace-this-with-a-long-random-secret"
```

The application has a development-only fallback so it can start without this variable, but you should set a unique secret for your own environment. Never commit a real secret to GitHub. Use a strong, randomly generated secret in any deployed environment.

### 5. Run the backend

Run this command from inside the `backend` directory:

```bash
uvicorn main:app --reload
```

The API runs at `http://127.0.0.1:8000`.

- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

## API Endpoints

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| GET | `/health` | Not required | Check API status |
| POST | `/register` | Not required | Register a user |
| POST | `/login` | Not required | Log in and receive a JWT |
| POST | `/projects` | Bearer token | Create a project |
| GET | `/projects` | Bearer token | List your projects |
| GET | `/projects/{project_id}` | Bearer token | Get one of your projects |
| DELETE | `/projects/{project_id}` | Bearer token | Delete one of your projects |

### Register

`POST /register`

Request body:

```json
{
  "email": "tester@example.com",
  "password": "your-password",
  "role": "Tester"
}
```

### Login

`POST /login`

Request body:

```json
{
  "email": "tester@example.com",
  "password": "your-password"
}
```

Successful response:

```json
{
  "access_token": "<your-jwt-access-token>",
  "token_type": "bearer",
  "role": "Tester"
}
```

The access token expires after 30 minutes. For protected endpoints, send it in the HTTP Authorization header:

```http
Authorization: Bearer <your-jwt-access-token>
```

### Create a project

`POST /projects`

Request body:

```json
{
  "name": "E-Commerce Website Testing",
  "description": "Manage test activities for the e-commerce application.",
  "status": "Active"
}
```

Allowed project statuses: `Active`, `Completed`, and `On Hold`.

### List projects

`GET /projects`

Returns only projects owned by the authenticated user.

### Get a project

`GET /projects/{project_id}`

Returns a project only if it belongs to the authenticated user. Otherwise, the API returns `404 Not Found`.

### Delete a project

`DELETE /projects/{project_id}`

Deletes a project only if it belongs to the authenticated user.

## Database Notes

The application creates missing tables automatically when it starts. Existing user records are preserved. Users whose passwords were stored using the previous SHA-256 implementation can still log in; after a successful login, their password hash is upgraded to bcrypt.

## Security Notes

- Project endpoints require a valid JWT bearer token.
- Project queries are restricted to the authenticated user's own records.
- New passwords are stored using bcrypt, not as plain text.
- The development JWT secret is not suitable for production. Set a strong `JWT_SECRET_KEY` environment variable before deployment.
- This is a learning project and should receive further security review before production use.

## Roadmap

- [x] FastAPI backend setup.
- [x] SQLite database integration.
- [x] User registration and login.
- [x] JWT authentication.
- [x] Bcrypt password hashing and legacy SHA-256 hash upgrade.
- [x] Project creation, listing, detail, and deletion APIs.
- [ ] Project update API.
- [ ] Role-based authorization.
- [ ] Test case management.
- [ ] Test execution and result tracking.
- [ ] Bug tracking and defect management.
- [ ] Frontend development.
- [ ] Automated API and end-to-end tests.
- [ ] Deployment.

## Project Status

**In Progress** — JWT authentication and the initial project management API are implemented in the backend. Further testing and QA management modules are planned.
