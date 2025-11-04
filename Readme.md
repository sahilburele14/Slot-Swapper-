SlotSwapper - Peer-to-Peer Time-Slot Scheduling Application
A full-stack application that allows users to swap calendar time slots with each other. Built as a technical challenge for ServiceHive's Full Stack Intern position.
🎯 Project Overview
SlotSwapper enables users to:

Manage their calendar events
Mark events as "swappable"
Browse other users' swappable slots
Request to swap slots with other users
Accept or reject incoming swap requests
Automatically update calendars when swaps are accepted

🛠️ Technology Stack
Backend

Runtime: Node.js
Framework: Express.js
Database: PostgreSQL
Authentication: JWT (JSON Web Tokens)
Password Hashing: bcryptjs

Frontend

Framework: React with TypeScript
Styling: Tailwind CSS
HTTP Client: Axios
Routing: React Router
State Management: React Context API + Hooks

📋 Prerequisites
Before you begin, ensure you have the following installed:

Node.js (v16 or higher)
PostgreSQL (v12 or higher)
npm or yarn
Git

🚀 Getting Started
1. Clone the Repository
bashgit clone https://github.com/yourusername/slotswapper.git
cd slotswapper
2. Database Setup
Create PostgreSQL Database
bash# Log into PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE slotswapper;

# Exit psql
\q
Run Database Schema
bashpsql -U postgres -d slotswapper -f database-schema.sql
This will create:

users table
events table with status enum
swap_requests table with status enum
Indexes for performance
Triggers for automatic timestamp updates

3. Backend Setup
Install Dependencies
bashcd backend
npm install
Configure Environment Variables
Create a .env file in the backend directory:
bashcp .env.example .env
Edit .env with your configurations:
envPORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=slotswapper
DB_USER=postgres
DB_PASSWORD=your_actual_password

JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

CORS_ORIGIN=http://localhost:3000
Start the Backend Server
bash# Development mode with auto-reload
npm run dev

# Production mode
npm start
The server will start on http://localhost:5000
4. Frontend Setup
Install Dependencies
bashcd frontend
npm install
Configure Environment Variables
Create a .env file in the frontend directory:
envREACT_APP_API_URL=http://localhost:5000/api
Start the Frontend Application
bashnpm start
The application will open in your browser at http://localhost:3000
📡 API Documentation
Authentication Endpoints
Sign Up
httpPOST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
Response:
json{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
Log In
httpPOST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
Event Endpoints
All event endpoints require authentication. Include the JWT token in the Authorization header:
Authorization: Bearer <your_jwt_token>
Get All Events
httpGET /api/events
Create Event
httpPOST /api/events
Content-Type: application/json

{
  "title": "Team Meeting",
  "startTime": "2024-12-01T10:00:00Z",
  "endTime": "2024-12-01T11:00:00Z",
  "status": "BUSY"
}
Update Event
httpPATCH /api/events/:id
Content-Type: application/json

{
  "status": "SWAPPABLE"
}
Delete Event
httpDELETE /api/events/:id
Swap Endpoints
Get Swappable Slots
httpGET /api/swappable-slots
Returns all slots marked as SWAPPABLE by other users (excludes your own).
Create Swap Request
httpPOST /api/swap-request
Content-Type: application/json

{
  "mySlotId": 5,
  "theirSlotId": 12
}
This endpoint:

Validates both slots exist and are SWAPPABLE
Creates a PENDING swap request
Sets both slots to SWAP_PENDING status

Respond to Swap Request
httpPOST /api/swap-response/:requestId
Content-Type: application/json

{
  "accept": true
}
If accepted:

Swaps ownership of both slots
Sets both slots to BUSY status
Marks request as ACCEPTED

If rejected:

Sets both slots back to SWAPPABLE
Marks request as REJECTED

Get Incoming Requests
httpGET /api/swap-requests/incoming
Get Outgoing Requests
httpGET /api/swap-requests/outgoing
🗂️ Project Structure
slotswapper/
├── backend/
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── controllers/
│   │   ├── authController.js   # Authentication logic
│   │   ├── eventsController.js # Event CRUD operations
│   │   └── swapController.js   # Swap logic
│   ├── middleware/
│   │   └── auth.js             # JWT verification
│   ├── routes/
│   │   ├── authRoutes.js       # Auth routes
│   │   ├── eventRoutes.js      # Event routes
│   │   └── swapRoutes.js       # Swap routes
│   ├── .env                    # Environment variables
│   ├── .env.example            # Example env file
│   ├── package.json
│   └── server.js               # Express app setup
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/           # Login/Signup components
│   │   │   ├── Dashboard/      # Event management
│   │   │   ├── Marketplace/    # Browse swappable slots
│   │   │   └── Requests/       # Manage swap requests
│   │   ├── context/
│   │   │   └── AuthContext.js  # Global auth state
│   │   ├── services/
│   │   │   └── api.js          # API service layer
│   │   ├── App.js
│   │   └── index.js
│   ├── .env
│   ├── package.json
│   └── tailwind.config.js
├── database-schema.sql
└── README.md
🔑 Key Features Implementation
1. JWT Authentication

Tokens generated on signup/login
Stored in localStorage on frontend
Sent as Bearer token in Authorization header
Verified by middleware on protected routes

2. Event Status Flow
BUSY → SWAPPABLE → SWAP_PENDING → BUSY (after accept)
                 ↓
              SWAPPABLE (after reject)
3. Swap Transaction Logic
The swap acceptance is implemented as a database transaction to ensure atomicity:

Begin transaction
Verify request exists and is PENDING
Swap user_id of both events
Update both events to BUSY status
Update request to ACCEPTED status
Commit transaction

If any step fails, the entire transaction is rolled back.
4. Frontend State Management

AuthContext provides global authentication state
Protected routes redirect to login if not authenticated
API calls automatically include JWT token
State updates trigger UI re-renders

🧪 Testing
Backend Tests
bashcd backend
npm test
Tests cover:

Authentication endpoints
Event CRUD operations
Swap request creation
Swap acceptance/rejection logic
Edge cases and error handling

Manual Testing with Postman

Import the Postman collection (if provided)
Set the {{baseUrl}} variable to http://localhost:5000
After login, set the {{token}} variable to the JWT received

🚢 Deployment
Backend Deployment (Render/Heroku)

Create a new web service
Connect your GitHub repository
Set environment variables in the dashboard
Deploy

Frontend Deployment (Vercel/Netlify)

Connect your GitHub repository
Set build command: npm run build
Set publish directory: build
Add environment variable: REACT_APP_API_URL=<your-backend-url>
Deploy

Database (Render/Heroku Postgres)

Create a PostgreSQL database
Note the connection string
Update backend environment variables
Run migrations

🐳 Docker Setup (Bonus)
bash# Build and start all services
docker-compose up --build

# Stop all services
docker-compose down
The docker-compose.yml includes:

PostgreSQL database
Backend API server
Frontend React app

💡 Design Decisions
Database Schema

Used PostgreSQL for ACID compliance and transaction support
Enum types for status fields ensure data integrity
Indexes on frequently queried columns for performance
Foreign key constraints maintain referential integrity

Swap Logic

Implemented as database transactions for atomicity
SWAP_PENDING status prevents race conditions
Request validation happens before state changes
Rollback mechanism for failed swaps

Authentication

JWT chosen for stateless authentication
Tokens include minimal payload (userId, email)
7-day expiration balances security and UX
bcrypt with salt rounds of 10 for password hashing

Frontend Architecture

Context API for simple global state management
Component-based structure for reusability
Protected routes for security
Optimistic UI updates for better UX

🎯 Challenges Faced

Concurrent Swap Requests: Solved by implementing SWAP_PENDING status and database transactions
State Synchronization: Used React Context and proper component lifecycle methods
Error Handling: Comprehensive try-catch blocks and meaningful error messages
Date/Time Handling: Standardized on ISO 8601 format with proper timezone handling

🔮 Future Enhancements

Real-time notifications with WebSockets
Calendar view with visual interface
Email notifications for swap requests
Recurring events support
Undo swap functionality
User profiles and avatars
Search and filter for marketplace
Mobile responsive design improvements

📝 Assumptions Made

Users manually enter event details (no calendar integration)
All times are in UTC (client handles timezone conversion)
Events cannot overlap (business logic decision)
Only 1-to-1 swaps are supported (no multi-way swaps)
Deleted events automatically cancel related swap requests (ON DELETE CASCADE)

👨‍💻 Author
Your Name

GitHub: @yourusername
Email: your.email@example.com

📄 License
This project is created for the ServiceHive Full Stack Intern technical challenge.
🙏 Acknowledgments

ServiceHive for the interesting challenge
PostgreSQL documentation
Express.js community
React community