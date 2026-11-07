# QA Management System

A full-stack web application designed to manage software testing activities, including test case management, test execution, and bug tracking. It aims to streamline QA workflows, monitor testing progress, and improve collaboration between testers and developers.

##  Project Overview

The QA Management System is a web-based platform that provides a centralized environment for managing software testing activities. It helps QA testers organize test cases, execute test scenarios, record test results, and report software defects.

The system also allows developers and administrators to monitor bugs, track project progress, and manage testing activities efficiently.

##  Project Objectives

- Build a complete full-stack web application.
- Simplify software testing and defect management.
- Manage test cases and test execution results.
- Track and prioritize reported bugs.
- Improve collaboration between testers and developers.
- Gain practical experience in REST API development and database management.
- Practice API testing and end-to-end automation testing.

##  Key Features

### 1. User Authentication & Authorization
- User registration and login.
- Secure password hashing.
- JWT-based authentication.
- Role-based access control (Admin, Tester, Developer).

### 2. Project Management
- Create, update, and delete projects.
- Assign team members to projects.
- View project details and progress.
- Manage project status.

### 3. Test Case Management
- Create, edit, and delete test cases.
- Assign unique test case IDs.
- Define test steps, preconditions, and expected results.
- Organize test cases into test suites.
- Categorize test cases by testing type.

### 4. Test Execution Management
- Execute test cases.
- Record execution results (Pass, Fail, Blocked).
- Add actual results and execution comments.
- Maintain execution history.
- Track testing progress.

### 5. Bug Tracking & Reporting
- Create and manage bug reports.
- Define steps to reproduce defects.
- Record expected and actual results.
- Set bug severity and priority.
- Assign bugs to developers.
- Track bug status and resolution.
- Attach screenshots and supporting evidence.

### 6. Dashboard & Analytics
- View total projects and test cases.
- Monitor passed, failed, and blocked test cases.
- Track open and resolved bugs.
- Visualize testing progress through charts.
- View project-wise testing statistics.

### 7. Search & Filtering
- Search projects and test cases.
- Filter bugs by severity, priority, and status.
- Search and organize testing records.

##  Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js |
| Styling | Tailwind CSS |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Authentication | JWT |
| API Testing | Postman |
| Automation Testing | Playwright |
| Version Control | Git, GitHub |

## System Architecture

The application follows a three-tier architecture:

1. **Presentation Layer:** React.js handles the user interface and user interactions.
2. **Application Layer:** FastAPI manages business logic, authentication, validation, and REST API endpoints.
3. **Data Layer:** PostgreSQL stores users, projects, test cases, test results, and bug reports.

**Application Flow:**

`React Frontend → FastAPI Backend → PostgreSQL Database`

##  Planned Project Structure

```text
qa-management-system/
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── services/
│       ├── hooks/
│       └── utils/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── database/
│   │   └── main.py
│   ├── tests/
│   └── requirements.txt
│
├── testing/
│   ├── manual/
│   ├── api/
│   └── automation/
│
├── docs/
├── .gitignore
└── README.md
```

##  Testing Strategy

The application will be tested using different testing approaches.

**Manual Testing**
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

**API Testing – Postman**
- Validate REST API endpoints.
- Verify HTTP status codes.
- Validate request and response bodies.
- Test authentication and authorization.
- Perform positive and negative testing.

**Automation Testing – Playwright**
- Automate login and registration.
- Test project management workflows.
- Automate test case creation.
- Test test execution functionality.
- Automate bug reporting workflows.
- Validate user interactions and navigation.

##  Installation & Setup

### Prerequisites

- Python 3.10+
- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd qa-management-system
```

### 2. Backend Setup

```bash
cd backend

python -m venv venv
```

Activate the virtual environment:

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/macOS:**
```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the backend server:

```bash
uvicorn app.main:app --reload
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

### 4. API Documentation

Once the backend is running, access the interactive API documentation:

`http://127.0.0.1:8000/docs`

*Note: Database configuration and environment variables will be documented as development progresses.*

##  Development Roadmap

- [ ] Requirement analysis and UI/UX design
- [ ] Database design and configuration
- [ ] Backend setup and REST API development
- [ ] User authentication and authorization
- [ ] Project management module
- [ ] Test case management module
- [ ] Test execution module
- [ ] Bug tracking module
- [ ] Dashboard and analytics
- [ ] Postman API testing
- [ ] Playwright automation testing
- [ ] Application deployment

##  Future Enhancements

- Email notifications for bug assignments.
- Real-time project updates.
- PDF and CSV report generation.
- GitHub integration.
- Advanced testing analytics.
- AI-assisted test case generation.
- AI-assisted bug report suggestions.

##  Learning Outcomes

This project aims to provide practical experience in:

- Full-stack web development.
- REST API development and integration.
- Database design and SQL.
- Authentication and authorization.
- Software Quality Assurance workflows.
- Manual and API testing.
- End-to-end test automation.
- Git and GitHub workflows.
- Application deployment.

##  Project Status

**Status:** In Progress 

This project is being developed as a practical learning initiative to explore full-stack web development and real-world Quality Assurance practices.



---

⭐ If you find this project interesting, feel free to explore the repository and follow its development.
