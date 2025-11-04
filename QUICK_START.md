SlotSwapper - Quick Start & Testing Guide
🚀 Quick Start (5 Minutes)
Option 1: Docker (Easiest)
bash# Clone and start everything with one command
git clone <your-repo-url>
cd slotswapper
docker-compose up --build
That's it! Visit:

Frontend: http://localhost:3000
Backend API: http://localhost:5000/api/health

Option 2: Manual Setup
bash# 1. Create database
psql -U postgres -c "CREATE DATABASE slotswapper;"
psql -U postgres -d slotswapper -f database-schema.sql

# 2. Setup backend
cd backend
cp .env.example .env
# Edit .env with your database password
npm install
npm run dev

# 3. In new terminal, setup frontend
cd frontend
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
npm install
npm start
🧪 Testing the Application
Test Scenario: Complete Swap Flow
Follow these steps to test all features:
1. Create Two Users
User 1 (Alice):

Go to http://localhost:3000/signup
Sign up with:

Name: Alice
Email: alice@test.com
Password: password123



User 2 (Bob):

Open an incognito/private window
Go to http://localhost:3000/signup
Sign up with:

Name: Bob
Email: bob@test.com
Password: password123



2. Alice Creates Events
In Alice's window:

Click "Dashboard"
Click "+ Create Event"
Create two events:

Event 1:

Title: "Team Meeting"
Start: Tomorrow at 10:00 AM
End: Tomorrow at 11:00 AM
Status: SWAPPABLE


Event 2:

Title: "Doctor Appointment"
Start: Tomorrow at 2:00 PM
End: Tomorrow at 3:00 PM
Status: BUSY





3. Bob Creates Events
In Bob's window:

Click "Dashboard"
Create two events:

Event 1:

Title: "Focus Block"
Start: Tomorrow at 9:00 AM
End: Tomorrow at 10:00 AM
Status: SWAPPABLE


Event 2:

Title: "Lunch Meeting"
Start: Tomorrow at 12:00 PM
End: Tomorrow at 1:00 PM
Status: SWAPPABLE





4. Alice Browses Marketplace
In Alice's window:

Click "Marketplace"
You should see Bob's two SWAPPABLE events
Click "Request Swap" on "Focus Block"
Select your "Team Meeting" to offer
Confirm the swap request

5. Bob Receives and Accepts Swap
In Bob's window:

Click "Requests"
You should see Alice's incoming swap request
Review the swap details
Click "Accept"

6. Verify the Swap
In Alice's window:

Go to "Dashboard"
You should now see "Focus Block" (formerly Bob's)
"Team Meeting" should be gone

In Bob's window:

Go to "Dashboard"
You should now see "Team Meeting" (formerly Alice's)
"Focus Block" should be gone

🔍 API Testing with cURL
1. Sign Up
bashcurl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
Expected Response:
json{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com"
  }
}
Save the token for subsequent requests.
2. Login
bashcurl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
3. Create Event
bashTOKEN="your_jwt_token_here"

curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Team Meeting",
    "startTime": "2024-12-01T10:00:00Z",
    "endTime": "2024-12-01T11:00:00Z",
    "status": "SWAPPABLE"
  }'
4. Get All Events
bashcurl -X GET http://localhost:5000/api/events \
  -H "Authorization: Bearer $TOKEN"
5. Update Event Status
bashEVENT_ID=1

curl -X PATCH http://localhost:5000/api/events/$EVENT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status": "SWAPPABLE"
  }'
6. Get Swappable Slots
bashcurl -X GET http://localhost:5000/api/swappable-slots \
  -H "Authorization: Bearer $TOKEN"
7. Create Swap Request
bashcurl -X POST http://localhost:5000/api/swap-request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "mySlotId": 1,
    "theirSlotId": 2
  }'
8. Accept Swap Request
bashREQUEST_ID=1

curl -X POST http://localhost:5000/api/swap-response/$REQUEST_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "accept": true
  }'
🐛 Troubleshooting
Backend Issues
Database Connection Error:
Error: connect ECONNREFUSED 127.0.0.1:5432
Solution: Make sure PostgreSQL is running and credentials in .env are correct.
Port Already in Use:
Error: listen EADDRINUSE: address already in use :::5000
Solution: Change PORT in backend/.env or kill the process using port 5000.
Frontend Issues
API Connection Error:
Network Error
Solution: Verify backend is running and REACT_APP_API_URL in frontend/.env is correct.
Build Errors:
Module not found
Solution: Delete node_modules and reinstall:
bashrm -rf node_modules package-lock.json
npm install
📊 Expected Database State After Swap
Before Swap
events table:
iduser_idtitlestatus11Team MeetingSWAP_PENDING22Focus BlockSWAP_PENDING
swap_requests table:
idrequester_idrequester_slot_idtarget_user_idtarget_slot_idstatus11122PENDING
After Swap Accepted
events table:
iduser_idtitlestatus12Team MeetingBUSY21Focus BlockBUSY
swap_requests table:
idrequester_idrequester_slot_idtarget_user_idtarget_slot_idstatus11122ACCEPTED
Notice how:

Event ownership (user_id) has been swapped
Both events are now BUSY
Swap request is marked ACCEPTED

✅ Feature Checklist
Test each feature and check off:

 User signup with validation
 User login with JWT
 Protected routes redirect to login
 Create event with all fields
 View all user events on dashboard
 Update event status (BUSY ↔ SWAPPABLE)
 Delete event
 View marketplace (other users' swappable slots)
 Create swap request
 View incoming swap requests
 View outgoing swap requests
 Accept swap request (verify ownership swap)
 Reject swap request (verify slots return to SWAPPABLE)
 Cannot swap with own slot (validation)
 Cannot swap SWAP_PENDING slots (validation)
 Logout clears token and redirects

🎯 Edge Cases to Test

Try to swap your own slot: Should show error
Try to swap non-SWAPPABLE slot: Should show error
Login with wrong password: Should show error
Create event with end time before start time: Should show error
Access protected route without token: Should redirect to login
Use expired/invalid JWT: Should get 401 error

📝 What to Include in Your Submission

GitHub Repository with all code
README.md with:

Project overview
Setup instructions
API documentation
Design decisions
Challenges faced


Screenshots or GIFs of the application working
Live Demo (optional but impressive):

Frontend on Vercel/Netlify
Backend on Render/Heroku
Database on Render Postgres



💡 Bonus Points

 Add unit tests for backend controllers
 Add integration tests for API endpoints
 Implement real-time notifications with WebSockets
 Deploy to cloud platform
 Add Docker support
 Implement email notifications
 Add calendar view instead of list view
 Add timezone support
 Add user profile page
 Implement search/filter in marketplace

Good luck with your submission! 🚀