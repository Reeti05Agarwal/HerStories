# HerStories Platform

A full-stack web application for sharing and preserving untold stories of remarkable women throughout history.

## Tech Stack

**Note:** This project uses **Vite + React** (not Next.js as previously mentioned).

### Frontend
- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 3
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Icons:** Lucide React
- **State Management:** React Hooks
- **Notifications:** Sonner

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (pg)
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Validation:** Zod

## Project Structure

```
feminism/
├── frontend/          # Vite + React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── sections/
│   │   ├── services/   # API client
│   │   ├── hooks/
│   │   ├── types/
│   │   └── lib/
│   ├── .env
│   └── package.json
├── backend/           # Express.js API server
│   ├── src/
│   │   ├── config/     # Database configuration
│   │   ├── models/     # Data models
│   │   ├── routes/     # API routes
│   │   ├── middleware/ # Auth middleware
│   │   └── server.js
│   ├── .env
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository** (or navigate to the project folder)

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   ```

4. **Configure environment variables:**

   **Backend** (`backend/.env`):
   ```env
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   JWT_SECRET=herstories-dev-secret-key-2024
   DATABASE_URL=postgresql://localhost:5432/herstories
   ```

   **Frontend** (`frontend/.env`):
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

5. **Set up PostgreSQL:**

   Create a PostgreSQL database and update `DATABASE_URL` in `backend/.env`.
   
   For local development with a local PostgreSQL instance:
   ```bash
   # Create database (example using psql)
   createdb herstories
   ```

6. **Initialize the database:**
   ```bash
   cd backend
   npm run init-db
   ```

   This creates:
   - All database tables
   - Default admin user
   - Sample stories

### Running the Application

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   Server runs on: http://localhost:3001

2. **Start the frontend (in a new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on: http://localhost:5173

## Default Credentials

**Admin Access:**
- Email: `admin@herstories.org`
- Password: `admin123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Stories
- `GET /api/stories` - Get all approved stories (with filters)
- `GET /api/stories/:id` - Get story by ID
- `POST /api/stories` - Create story (admin only)
- `PUT /api/stories/:id` - Update story (admin only)
- `DELETE /api/stories/:id` - Delete story (admin only)

### Submissions
- `GET /api/submissions` - Get all submissions (admin only)
- `GET /api/submissions/:id` - Get submission by ID (admin only)
- `POST /api/submissions` - Create submission (public)
- `POST /api/submissions/:id/approve` - Approve submission (admin only)
- `POST /api/submissions/:id/reject` - Reject submission (admin only)
- `DELETE /api/submissions/:id` - Delete submission (admin only)

### Contributions
- `GET /api/contributions` - Get all contributions (admin only)
- `GET /api/contributions/:id` - Get contribution by ID (admin only)
- `POST /api/contributions` - Create contribution (public)
- `POST /api/contributions/:id/approve` - Approve contribution (admin only)
- `POST /api/contributions/:id/reject` - Reject contribution (admin only)
- `DELETE /api/contributions/:id` - Delete contribution (admin only)

### Contributors
- `GET /api/contributors/me` - Get current contributor data
- `GET /api/contributors` - Get all contributors (authenticated)

### Stats
- `GET /api/stats` - Get admin statistics (admin only)

### Health Check
- `GET /api/health` - Server health check

## Features

### Public Features
- Browse approved stories
- Filter stories by category, era, and region
- Search stories
- Submit new stories
- Contribute to existing stories
- View contributor dashboard

### Admin Features
- Review and approve/reject story submissions
- Review and approve/reject contributions
- Create new stories directly
- View platform statistics
- Manage all content

## Story Categories

- Science & Research
- Arts & Culture
- Politics & Leadership
- Activism & Social Justice
- Business & Entrepreneurship
- Education & Academia
- Healthcare & Medicine
- Sports & Athletics
- Technology & Innovation
- Other Fields

## Era Options

- Ancient (Before 500 CE)
- Medieval (500-1500)
- Early Modern (1500-1800)
- 19th Century
- Early 20th Century (1900-1945)
- Mid 20th Century (1945-1975)
- Late 20th Century (1975-2000)
- 21st Century

## Development

### Build for Production

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
```bash
cd backend
npm run build  # If you have a build step
```

### Linting

```bash
cd frontend
npm run lint
```

## Database Schema

The application uses PostgreSQL with the following tables:

- `users` - Admin users for authentication
- `stories` - Published stories
- `submissions` - User-submitted stories pending review
- `contributions` - User contributions to existing stories
- `contributors` - Contributor information
- `contributor_activities` - Tracks all contributor activities

## License

MIT
