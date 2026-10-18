 #  🎟️ EventBook – Full-Stack Event Booking System
 > ** full-stack event booking platform built with Next.js, Node.js/Express, and Supabase (PostgreSQL), featuring secure cross-domain cookie authentication and strict concurrency-safe booking rules.


## 🌟 1.  Demo:
Frontend (Vercel): https://event-booking-sigma-seven.vercel.app
Backend API (Render): https://eventbooking-pq7r.onrender.com
GitHub Repository: https://github.com/sujan24-w


## 🚀 2. Test Credentials
| Role | Email | Password |
|:-- |:--   |:--
| **Admin** | **admin@eventbook.com** | | **eventbooksujan@2026 ** |     
   
| **Attendee1** | **sagar@eventbook.com ** | | **UserPassword123!** |  

| **Attendee2** | **sujal@eventbook.com** | | **UserPassword123!** |  
 


## 🔒 3. Concurrency-Safe Capacity Enforcement & Anti-Overselling Deep Dive

### The Problem: Race Conditions & Ticket Overselling
When an event has **1 seat remaining** and two attendees (User A and User B) click "Book Now" at the exact same millisecond:
1. User A reads available seats: `1 > 0` (True)
2. User B reads available seats: `1 > 0` (True)
3. User A inserts booking #1 (Capacity reached)
4. User B inserts booking #2 (**OVERSELL ERROR: 2 seats sold for capacity 1!**)



```sql

-- One active booking per user per event
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_booking
ON bookings (event_id, user_id)
WHERE status = 'ACTIVE';

-- Booking query indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id
ON bookings (user_id);

CREATE INDEX IF NOT EXISTS idx_bookings_event_active
ON bookings (event_id)
WHERE status = 'ACTIVE';

```




## 💻  Setup & Run Instructions

### Prerequisites
- Node.js (v18+)
- Supabase PostgreSQL  pool  coonecting String 

### Step 1: Database Migration & Seeding
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Run database schema migration
npm run migrate

# (Optional) Seed initial demo accounts and sample events
npm run seed
```


### Step 2: Start Backend Server
```bash
cd backend
npm run dev
# Server running at http://localhost:5000
```

---

### Step 3: Start Frontend Client
```bash
# Open a new terminal
cd frontend
npm install
npm run dev
# Frontend running at http://localhost:5173
```

---

Event Browsing & Booking: Browse upcoming events, view details, and book seats in real time.

User Dashboard: View and manage personal event bookings.

Responsive UI: Clean, modern interface built with React, TypeScript, and Tailwind CSS.

Dynamic Fallbacks: Automated image fallbacks for events without custom cover photos.