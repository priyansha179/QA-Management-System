# QA Management System

A full-stack QA Management System currently under development. The backend provides authentication and project management APIs for organizing QA work. Planned modules include test cases, test execution, and defect tracking.

## Current Backend Features

- User registration and login.
- JWT bearer-token authentication.
- Bcrypt password hashing for new accounts.
- Automatic upgrade of existing SHA-256 password hashes to bcrypt after a successful login.
- Create, list, view, update, and delete projects.
- Project data is scoped to the authenticated owner.
- SQLite database with SQLAlchemy ORM.
- Safe startup migration for the older projects table; existing records are preserved.
- Interactive API documentation through Swagger UI and ReDoc.

## Technology Stack

| Category | Technology |
|---|---|
| Language | Python |
| Backend | FastAPI |
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
├── .gitignore
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── AuthContext.jsx
│   │   ├── api.js
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── .gitignore
├── .gitignore
└── README.md
```

The SQLite database file is created in the backend directory when the application runs. It is intentionally excluded from Git because it contains local application data.

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

From the repository root:

**Windows PowerShell**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**macOS / Linux**
```bash
python -m venv venv
source venv/bin/activate
```

### 3. Install backend dependencies

```bash
cd backend
python -m pip install -r requirements.txt
```

### 4. Configure the JWT secret

**Windows PowerShell**
```powershell
$env:JWT_SECRET_KEY = "replace-this-with-a-long-random-secret"
```

**macOS / Linux**
```bash
export JWT_SECRET_KEY="replace-this-with-a-long-random-secret"
```

The application includes a development-only fallback secret so it can start locally, but you should set your own secret. Never commit a real secret to GitHub or use the development fallback in production.

### 5. Start the backend

Run this from inside the `backend` directory:

```bash
uvicorn main:app --reload
```

The API will be available at:

- API: http://127.0.0.1:8000
- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

On startup, the backend creates missing tables and adds the `owner_id` and `created_at` columns to an older `projects` table when needed. Existing user and project rows are retained. Projects created before ownership was introduced remain unassigned and are not returned in users' project lists.

## Frontend

The React frontend is built with Vite and React Router. It currently includes:

- Registration and login screens connected to the backend API.
- JWT session storage and protected dashboard access.
- Responsive QA workspace layout.
- Project dashboard with total, active, and completed project counts.
- Project listing, search, and status filtering.
- Create, edit, and delete project actions.
- Loading, empty, and API error states.

### Run the frontend

Open a second terminal from the repository root:

```bash
cd frontend
npm install
```

Copy `.env.example` to `.env` if your backend is running at a different address, then set `VITE_API_URL` to the backend base URL. The default is `http://127.0.0.1:8000`.

Start the Vite development server:

```bash
npm run dev
```

Open http://localhost:5173 in your browser. Keep the FastAPI server running in the first terminal. The backend allows the default Vite development origins; set `FRONTEND_ORIGINS` to a comma-separated list of allowed origins when hosting the frontend elsewhere.

Create a production build with:

```bash
npm run build
```

## API Endpoints

| Method | Endpoint | Auth required | Description |
|---|---|---:|---|
| GET | `/health` | No | Check API status |
| POST | `/register` | No | Create a user account |
| POST | `/login` | No | Receive a JWT access token |
| POST | `/projects` | Yes | Create a project |
| GET | `/projects` | Yes | List your projects |
| GET | `/projects/{project_id}` | Yes | Get one of your projects |
| PUT | `/projects/{project_id}` | Yes | Update one of your projects |
| DELETE | `/projects/{project_id}` | Yes | Delete one of your projects |

### Register

`POST /register`

Request JSON:
```json
{
  "email": "tester@example.com",
  "password": "your-password"
}
```

Passwords must be at least 8 characters. New accounts receive the `Tester` role by default; the public registration endpoint does not allow users to assign themselves privileged roles.

### Login

`POST /login`

Request JSON:
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

The token expires after 30 minutes. For protected endpoints, send:

```http
Authorization: Bearer <your-jwt-access-token>
```

In Swagger UI, click **Authorize** and enter the token. If the UI asks for the scheme, use `Bearer` followed by the token.

### Create a project

`POST /projects`

```json
{
  "name": "E-Commerce Website Testing",
  "description": "Manage test activities for the e-commerce application.",
  "status": "Active"
}
```

Allowed statuses: `Active`, `Completed`, and `On Hold`.

### Update a project

`PUT /projects/{project_id}`

Send only the fields you want to change:

```json
{
  "status": "Completed"
}
```

### Project access

Users can view, update, or delete only projects they own. Requests for projects owned by another user return `404 Not Found`.

## Security Notes

- Protected project routes require a valid JWT bearer token.
- New passwords are hashed with bcrypt.
- Legacy SHA-256 password hashes are supported for login and upgraded after successful authentication.
- The JWT secret must be configured securely before deployment.
- This is a learning project and needs further security review and automated testing before production use.

## Roadmap

- [x] FastAPI backend setup.
- [x] SQLite database integration.
- [x] User registration and login.
- [x] JWT authentication.
- [x] Bcrypt password hashing and legacy hash upgrade.
- [x] Project create, read, update, and delete APIs.
- [x] Ownership checks for project access.
- [x] Startup migration for existing project databases.
- [ ] Team and project member management.
- [ ] Test case management.
- [ ] Test execution and result tracking.
- [ ] Bug and defect tracking.
- [x] React frontend foundation with authentication and project management dashboard.
- [ ] Automated API and end-to-end tests.
- [ ] Deployment.

## Project Status

**In Progress** — Backend authentication, project CRUD, and the first React frontend are implemented. Test case management, test execution, defect tracking, and deployment remain planned.
