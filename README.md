# Sims App - Developer Documentation

A full-stack project budgeting and proposal management application built with Express.js, React, TypeScript, and PostgreSQL.

> **For end-user documentation, see [USER_GUIDE.md](USER_GUIDE.md)**

## Overview

Sims App is a custom-built sales tool developed for Sims Inc., a kitchen and bath design company based in Stoughton, WI.

This application enables sales associates and designers to manage projects, organize client information, and create multi-tier pricing proposals. Each proposal includes customizable line items, upgrade options, and cost breakdowns. The app supports a structured Good / Better / Best pricing model, which allows clients to explore different budget tiers for their project.

By walking clients through these interactive proposals, designers can clearly communicate budget allocation, explain where money is being spent, and collaboratively identify the best mix of options based on the client’s needs and preferences.

## Features

- **Project Management**: Create and manage projects with multiple areas
- **Client Management**: Create clients and associate them with projects
- **Budget Creation**: Build detailed budgets with line items, groups, and categories
- **Three-Tier Pricing**: Support for Premier, Designer, and Luxury pricing tiers
- **Template System**: Create reusable templates for quick project setup
- **User Management**: Role-based access control (USER, ADMIN, SUPER_ADMIN)
- **Cost Calculations**: Automatic margin calculations
- **Drag-and-Drop Reordering**: Reorder line items and groups within projects
- **Real-time Updates**: Optimistic UI updates with React Query

## Tech Stack

### Backend
- **Node.js** (v23.7.0)
- **Express.js** - RESTful API server
- **TypeScript** - Type-safe backend code
- **Prisma** - ORM for database management
- **PostgreSQL** - Relational database
- **Passport.js** - Authentication middleware
- **Express Session** - Session management with Prisma session store
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe frontend code
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **TanStack Query (React Query)** - Data fetching and caching
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Icon library
- **@hello-pangea/dnd** - Drag-and-drop functionality
- **React Number Format** - Number formatting components

## Prerequisites

- Node.js v23.7.0
- PostgreSQL 17
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sims_api
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/sims-db"
   DATABASE_URL_DEV="postgresql://user:password@localhost:5433/sims-db"
   
   # Session
   SESSION_SECRET="your-session-secret-key-here"
   
   # Node Environment
   NODE_ENV="development"
   
   # Port (optional, defaults to 3000)
   PORT=3000
   ```

5. **Set up the database**

   Using Docker Compose (recommended for development):
   ```bash
   docker-compose up -d
   ```

   Or set up PostgreSQL manually and update `DATABASE_URL` in your `.env` file.

6. **Run Prisma migrations**
   ```bash
   npx prisma migrate dev
   ```

7. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

8. **Seed the database (optional)**
   ```bash
   npx prisma db seed
   ```

## Development

### Running the Development Server

**Backend only:**
```bash
npm run dev
```

**Frontend only:**
```bash
cd client
npm run dev
```

**Full stack (backend + frontend):**
The backend serves the built frontend in production mode. For development, run both separately:
- Backend: `npm run dev` (runs on http://localhost:3000)
- Frontend: `cd client && npm run dev` (runs on http://localhost:5173)

### Database Management

**Create a migration:**
```bash
npx prisma migrate dev --name your_migration_name
```

**Push schema changes (development only):**
```bash
npx prisma db push
```

**Reset database (development only - WARNING: deletes all data):**
```bash
npx prisma db push --force-reset
npx prisma db seed
```

**View database in Prisma Studio:**
```bash
npx prisma studio
```

## Building for Production

```bash
npm run build
```

This will:
1. Compile TypeScript backend code
2. Build the React frontend
3. Copy frontend build to `dist/client/`

## Deployment

The application is configured for Heroku deployment with a `Procfile`. 

**Heroku-specific build:**
```bash
npm run heroku-postbuild
```

**Environment variables to set on Heroku:**
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret key for session encryption
- `NODE_ENV` - Set to "production"

## Project Structure

```
sims_api/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── api/           # API client functions
│   │   ├── app/           # App configuration and routing
│   │   ├── components/    # Reusable React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── routes/        # Page components
│   │   └── util/          # Utility functions
│   ├── public/            # Static assets
│   └── package.json
├── prisma/                # Database schema and migrations
│   ├── schema.prisma      # Prisma schema definition
│   ├── seed.ts            # Database seeding script
│   └── prisma-client.ts   # Prisma client instance
├── src/                   # Backend Express application
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic layer
│   ├── repository/        # Data access layer
│   ├── middleware/        # Express middleware
│   ├── auth/              # Authentication configuration
│   └── app.ts             # Express app entry point
├── docker-compose.yml     # Docker configuration for local DB
├── package.json
└── README.md
```

## API Routes

- `/api/auth` - Authentication endpoints
- `/api/projects` - Project management
- `/api/project-areas` - Project area management
- `/api/line-items` - Line item operations
- `/api/groups` - Line item group management
- `/api/templates` - Template management
- `/api/options` - Line item option management
- `/api/units` - Unit management
- `/api/clients` - Client management
- `/api/users` - User management

## Key Features Explained

### Three-Tier Pricing System
Projects support three pricing tiers:
- **Premier** (Tier 1) - Entry-level pricing
- **Designer** (Tier 2) - Mid-range pricing
- **Luxury** (Tier 3) - Premium pricing

Each line item option can be assigned to a tier, and the system calculates totals for each tier.

### Margin Calculations
The system uses margin-based pricing:
- Margin formula: `(Sale Price - Cost) / Sale Price`
- Sale price from cost: `Cost / (1 - Margin)`
- Supports quantity-based calculations for total pricing

### Template System
Reusable area templates preserve line item structure, group organization, option configurations, and category assignments when creating new project areas.

### Data Layer
- **Repository Pattern**: Data access layer (`src/repository/`)
- **Service Layer**: Business logic (`src/services/`)
- **Route Handlers**: API endpoints (`src/routes/`)
- **Prisma ORM**: Database queries and migrations

## Authentication & Authorization

### User Roles

**USER**
- Can create and manage their own projects
- Can view and manage clients
- Can create projects from templates

**ADMIN**
- All USER permissions
- Access to Users and Settings pages
- Can manage regular users (create, edit, delete, block, reset password)
- Cannot create other ADMIN users or modify SUPER_ADMIN users

**SUPER_ADMIN**
- All ADMIN permissions
- Can create ADMIN users and promote users to ADMIN
- Protected: Cannot be modified or deleted
- Must be created via database seed or direct database access

### Middleware
- `isAuthenticated`: Verifies user session
- `isAdmin`: Requires ADMIN or SUPER_ADMIN role

## API Documentation

### Authentication Endpoints

**Password Reset (Admin only):**
```bash
POST /api/auth/users/{userAccountId}/reset-password
Content-Type: application/json

{
  "secretKey": "your-secret-key"
}
```

Returns a temporary password. User must change password on first login.

### Available Routes

- `/api/auth` - Authentication (login, logout, password reset)
- `/api/projects` - Project CRUD operations
- `/api/project-areas` - Project area management
- `/api/line-items` - Line item operations
- `/api/groups` - Line item group management
- `/api/templates` - Template management
- `/api/options` - Line item option management
- `/api/units` - Unit management
- `/api/clients` - Client management
- `/api/users` - User management (Admin only) 



## License

ISC

## Support

For technical issues, please open an issue in the repository.

For user support questions, refer to [USER_GUIDE.md](USER_GUIDE.md) or contact your system administrator. This app was originally built by Joey Pettit who can be reached at joeywpettit@gmail.com.

