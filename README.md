# retain-expense-manager

# Retain — Personal Expense & Budget Manager

**Retain** is a full-stack personal finance management application designed to help users track their expenses, manage monthly budgets, and understand their spending habits. It also provides an administrator dashboard for monitoring platform-wide activity, managing categories, and reviewing financial records.

The application combines a responsive React interface with a TypeScript and Express backend, a PostgreSQL database, and secure, token-based authentication.

## Table of Contents

- [Project Overview](#project-overview)
- [Objectives](#objectives)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Application Architecture](#application-architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [User Roles and Access Control](#user-roles-and-access-control)
- [API Documentation](#api-documentation)
- [State Management](#state-management)
- [Security Considerations](#security-considerations)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [Author](#author)
- [License](#license)

## Project Overview

Managing personal finances requires keeping track of expenses, understanding spending patterns, and planning how money should be used. Retain provides a centralized place to record expenses, monitor a monthly budget, and review financial activity.

The application has two main areas:

**1. User Dashboard**

Users can manage their personal expenses, monitor monthly spending, set budgets, and view spending summaries.

**2. Administrator Dashboard**

Administrators can review platform-wide statistics, view registered users, inspect expenses across the platform, and analyze spending by category.

The project demonstrates full-stack web development concepts, including REST API development, authentication and authorization, database relationships, frontend state management, reusable React components, and responsive interface design.

## Objectives

The main objectives of Retain are to:

- Provide a simple and organized way to record personal expenses.
- Help users monitor monthly spending against a budget.
- Present financial information in an easy-to-understand format.
- Support secure authentication and role-based access control.
- Demonstrate communication between a React frontend and a REST API.
- Apply TypeScript to improve code readability and type safety.
- Use Redux and React Context for organized state management.
- Provide administrators with an overview of platform activity.

## Features

### User Features

- **Authentication:** Create an account and log in securely.
- **Personal Dashboard:** View a summary of monthly spending and budget information.
- **Expense Management:** Record and review expenses with relevant details.
- **Expense Details:** Store information such as title, amount, category, date, payment method, description, and notes.
- **Budget Management:** Manage a monthly budget and review the remaining amount.
- **Spending Insights:** Review spending by category and identify high-value expenses.
- **Expense Filtering:** Search, filter, sort, and navigate expense records where supported by the interface.
- **Responsive Design:** Use the application across desktop, tablet, and mobile screen sizes.

### Administrator Features

- **Admin Dashboard:** View platform-wide statistics and recent activity.
- **User Management View:** Review registered users and their account roles.
- **Expense Overview:** View expenses across the platform.
- **Expense Search and Filtering:** Find records using available search, category, payment-method, and sorting controls.
- **Analytics Dashboard:** Compare category spending and review the highest- and lowest-spending categories.
- **Category Management:** Access the category administration section.
- **Role-Based Access:** Restrict administrator endpoints to authenticated users with the administrator role.

### Interface and Usability

- Modern finance-inspired color theme.
- Consistent navigation and page layouts.
- Reusable interface components.
- Responsive page layouts and forms.
- Clear presentation of financial summaries and tables.

## Technology Stack

| Technology | Purpose |
|---|---|
| React | Building the user interface |
| TypeScript | Static typing and safer application development |
| Vite | Frontend development server and build tooling |
| Redux | Managing shared application state |
| React Context API | Managing authentication state |
| React Router | Navigation between application pages |
| Node.js | Backend JavaScript runtime |
| Express.js | Building REST API endpoints |
| PostgreSQL | Relational database |
| Prisma ORM | Database schema, queries, and migrations |
| `@prisma/adapter-pg` | PostgreSQL adapter for Prisma |
| JSON Web Tokens (JWT) | Authentication tokens |
| bcrypt | Password hashing |
| CSS | Styling and responsive layouts |
| Git and GitHub | Version control and source-code hosting |

## Application Architecture

Retain follows a client-server architecture.

```text
                RETAIN APPLICATION
                        |
          +-------------+-------------+
          |                           |
     React Frontend              Express API
     React + TypeScript          Node.js + TypeScript
          |                           |
          |       HTTP Requests       |
          +-------------------------->|
                                      |
                              Authentication
                              JWT Middleware
                                      |
                              Controllers and
                                 Routes
                                      |
                                Prisma ORM
                                      |
                               PostgreSQL
                                  Database
```

### How It Works

1. A user interacts with the React frontend.
2. The frontend sends HTTP requests to the Express API.
3. Protected requests include a JWT in the authorization header.
4. Authentication middleware verifies the token and identifies the current user.
5. The backend processes the request and communicates with PostgreSQL through Prisma.
6. The API returns a response to the frontend.
7. React updates the interface using the returned data and application state.

## Project Structure

The project separates the frontend and backend to keep the application organized.

```text
retain-expense-manager/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── store/
│   │   │   ├── expenseSlice.ts
│   │   │   ├── categorySlice.ts
│   │   │   └── budgetSlice.ts
│   │   ├── App.tsx
│   │   └── App.css
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   │   └── adminController.ts
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts
│   │   ├── routes/
│   │   │   └── adminRoutes.ts
│   │   └── server.ts
│   ├── .env
│   └── package.json
│
├── .gitignore
└── README.md
```

*Note: This is a representative structure. Update the folder and file names to match the actual structure in your repository.*

## Getting Started

Follow these instructions to run the application locally.

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/) — use a version compatible with your project's dependencies.
- npm, included with Node.js.
- [PostgreSQL](https://www.postgresql.org/).
- [Git](https://git-scm.com/).
- A code editor such as Visual Studio Code.

You should also have access to the project repository.

### 1. Clone the Repository

```bash
git clone https://github.com/Christia3/retain-expense-manager.git
cd retain-expense-manager
```

### 2. Install Dependencies

Install the frontend dependencies:

```bash
cd frontend
npm install
```

Install the backend dependencies in a separate terminal:

```bash
cd backend
npm install
```

If your repository uses a different folder structure, navigate to the directories containing the corresponding `package.json` files.

## Environment Configuration

The backend requires environment variables for database connectivity, authentication, and server configuration.

Create a `.env` file in the backend directory if that is where your backend configuration expects it.

Example:

```env
PORT=5000
DATABASE_URL="postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@localhost:5432/retain_db"
JWT_SECRET="replace_with_a_long_random_secret"
```

Replace the database username and password with your local PostgreSQL credentials. Make sure the database named `retain_db` exists, or create a database with the name configured in your connection string.

**Important:** The values above are examples. Use the exact environment variable names and configuration expected by your backend.

Never commit your real `.env` file, database credentials, JWT secret, passwords, or authentication tokens to GitHub.

## Database Setup

Retain uses PostgreSQL to store application data and Prisma ORM to manage the database schema.

### 1. Create the Database

Create a PostgreSQL database named `retain_db`, or update `DATABASE_URL` to use your existing database.

### 2. Configure Prisma

Ensure your Prisma configuration and PostgreSQL adapter are set up according to the project's existing backend implementation.

### 3. Apply Database Migrations

From the backend directory, run the migration command used by the project:

```bash
npx prisma migrate dev
```

If your Prisma setup requires a schema path or configuration-specific command, use the command configured for your project.

### 4. Generate Prisma Client

If it is required by your Prisma configuration, run:

```bash
npx prisma generate
```

The database schema includes the following main entities:

| Model | Purpose |
|---|---|
| `User` | Stores user account information and roles |
| `Category` | Organizes expenses into categories |
| `Expense` | Stores individual expense records |
| `Budget` | Stores monthly budget information for users |

The main relationships include:

- A user can have multiple expenses.
- A category can be associated with multiple expenses.
- A user can have monthly budget records.
- Each expense belongs to a user and a category.
- A monthly budget is associated with a user and month.

The database also uses enumerated values for user roles and payment methods, helping keep these fields consistent.

## Running the Application

Run the frontend and backend in separate terminals.

### Start the Backend

Open a terminal in the backend directory:

```bash
cd backend
npm run dev
```

The backend is configured to run on port `5000` in the local development setup.

API base URL:

```text
http://localhost:5000/api
```

### Start the Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

Vite typically displays the local frontend URL in the terminal. In the current development setup, the application uses:

```text
http://localhost:5173
```

If either `npm run dev` command is not available, check the relevant `package.json` and use the development script defined there.

### Verify the Application

After starting both servers:

1. Open the frontend URL in your browser.
2. Create a user account or log in.
3. Open the dashboard.
4. Add an expense and confirm that it appears in your expense list.
5. Review the budget and analytics pages.
6. If testing administrator functionality, sign in with an account that has the administrator role.

## User Roles and Access Control

Retain supports two user roles:

| Role | Access |
|---|---|
| `USER` | Personal dashboard, expenses, budgets, and available personal analytics |
| `ADMIN` | Administrator dashboard, platform-wide expense overview, user overview, and administrative analytics |

### Authentication Flow

1. A user registers or submits login credentials.
2. The backend verifies the credentials.
3. The backend issues a JWT after successful authentication.
4. The frontend stores the authentication token and user information.
5. Protected API requests send the token in the `Authorization` header.
6. Middleware validates the token and enforces access restrictions.

Example authorization header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Administrator endpoints require both authentication and the administrator role. Regular user expense and budget operations should remain scoped to the authenticated user's account.

## API Documentation

The API uses the base URL:

```text
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/auth/signup` | Register a new user |
| `POST` | `/auth/login` | Authenticate an existing user |

### Expense Endpoints

Expense routes are mounted under `/api/expenses`.

Use the backend's configured expense routes for creating, retrieving, updating, and deleting expense records. Protected user operations should access only records belonging to the authenticated user.

### Category Endpoints

Category routes are mounted under `/api/categories`.

These routes support retrieving available categories and performing the category operations permitted by the user's role.

### Budget Endpoints

Budget routes are mounted under `/api/budget`.

These routes provide access to monthly budget functionality. Budget operations should be restricted to the authenticated user's own records.

### Administrator Endpoints

All administrator endpoints require authentication and the `ADMIN` role.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/admin/insights` | Retrieve platform-wide statistics and spending analytics |
| `GET` | `/admin/users` | Retrieve registered users and their account information |
| `GET` | `/admin/expenses` | Retrieve expenses across the platform |

### Example API Request

Retrieve administrator insights using a valid administrator token:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/admin/insights
```

A successful request returns JSON data containing platform statistics and analytics. Requests without valid authentication or the required administrator role should be rejected.

*Note: For exact request bodies, response schemas, and all expense, category, and budget routes, refer to the route and controller implementations in the backend.*

## State Management

Retain uses different state management approaches based on the type of information being handled.

### React Context API

The authentication context manages authentication-related state, including the current user and token. It also supports login, registration, and logout operations.

### Redux

Redux is used to organize shared application state for areas such as:

- Expenses
- Categories
- Budgets

The application uses Redux slices to group state, reducers, and related actions by feature.

### Why Use Both?

Context API provides a convenient way to make authentication information available throughout the component tree. Redux provides a structured approach for managing shared feature state as the application grows.

Keeping state organized helps improve maintainability and makes components easier to reason about.

## Security Considerations

Security is important because the application handles user accounts and financial records.

The application includes several security-related mechanisms:

- Password hashing using bcrypt.
- JWT-based authentication.
- Authentication middleware for protected routes.
- Role-based authorization for administrator endpoints.
- User-scoped access to personal expense and budget data.
- Environment variables for sensitive configuration.

For a production deployment, additional safeguards should be reviewed and implemented where appropriate:

- Enforce HTTPS.
- Use strong, randomly generated JWT secrets.
- Validate and sanitize incoming request data.
- Configure CORS for trusted frontend origins.
- Add rate limiting to authentication endpoints.
- Review token storage and expiration policies.
- Use secure database credentials and appropriate database permissions.
- Avoid exposing passwords, secrets, or sensitive financial data in logs.
- Add automated tests for authentication, authorization, and ownership checks.

## Future Improvements

Potential improvements for future versions include:

- Interactive charts and more advanced spending analytics.
- Exporting expenses to CSV or PDF.
- Recurring expense support.
- Notifications when spending approaches a budget limit.
- Improved transaction search and reporting.
- Automated testing for frontend and backend functionality.
- API documentation using Swagger or OpenAPI.
- Production deployment with environment-specific configuration.
- More advanced accessibility improvements.

These are possible future enhancements and are not necessarily implemented in the current version.

## Contributing

Contributions, suggestions, and bug reports are welcome.

To contribute:

1. Fork the repository.
2. Create a feature branch.

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Make your changes.
4. Test the application locally.
5. Commit your changes.

   ```bash
   git add .
   git commit -m "Describe your changes"
   ```

6. Push your branch.

   ```bash
   git push origin feature/your-feature-name
   ```

7. Open a pull request describing the changes.

Please avoid committing generated files, local configuration files, database credentials, or secrets.

## Author

**Retain — Personal Expense & Budget Manager**

Developed as a full-stack application to demonstrate frontend development, backend API design, database integration, authentication, state management, and financial data visualization.

**GitHub Repository:**  
https://github.com/Christia3/retain-expense-manager

## License

No license has been specified in this repository yet. If you plan to make the project available for reuse, add a `LICENSE` file and update this section to reflect your chosen license.
