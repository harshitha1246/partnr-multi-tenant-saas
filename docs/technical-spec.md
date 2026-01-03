# Step 1.2.2: Technical Specification

## 1. Project Structure

This section defines the complete folder structure for both backend and frontend applications, following industry best practices for maintainability and scalability.

---

## Backend Project Structure

```
backend/
├── src/
│   ├── controllers/      # Request handling logic
│   ├── routes/           # API route definitions
│   ├── models/           # Database models/entities
│   ├── middleware/       # Auth, tenant resolution, RBAC
│   ├── services/         # Business logic layer
│   ├── utils/            # Helper functions and utilities
│   ├── config/           # Environment and DB configuration
│   └── app.js            # Express app initialization
├── migrations/           # Database migration files
├── tests/                # Unit and integration tests
├── package.json          # Dependencies and scripts
└── server.js             # Application entry point
```

### Backend Folder Explanation

* **controllers/**: Handles incoming requests and sends responses.
* **routes/**: Maps endpoints to controllers.
* **models/**: Defines database schemas and relationships.
* **middleware/**: Contains authentication, authorization, and tenant isolation logic.
* **services/**: Implements core business rules.
* **utils/**: Reusable helper functions.
* **config/**: Database connection and environment setup.
* **migrations/**: Version-controlled database schema changes.
* **tests/**: Automated test cases.

---

## Frontend Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page-level components
│   ├── services/         # API interaction logic
│   ├── context/          # Auth and global state
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helper utilities
│   ├── styles/           # Global styles
│   ├── App.js            # Root component
│   └── index.js          # Application entry point
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

### Frontend Folder Explanation

* **components/**: Reusable UI elements.
* **pages/**: Represents application pages.
* **services/**: Handles API calls.
* **context/**: Manages authentication and shared state.
* **hooks/**: Encapsulates reusable logic.
* **styles/**: Global CSS or styling files.

---

## 2. Development Setup Guide

### Prerequisites

* Node.js v18 or later
* npm or yarn
* PostgreSQL v13+
* Git

---

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/saas_db
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=24h
```

---

### Installation Steps

1. Clone the repository
2. Navigate to backend directory
3. Install dependencies:

   ```
   npm install
   ```
4. Navigate to frontend directory
5. Install frontend dependencies:

   ```
   npm install
   ```

---

### Running the Application Locally

#### Backend

```
npm run dev
```

#### Frontend

```
npm start
```

The frontend will connect to the backend via configured API base URL.

---

### Running Tests

#### Backend Tests

```
npm test
```

Tests include unit tests and API integration tests.

---

**Status:** Completed
