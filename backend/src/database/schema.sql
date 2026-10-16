CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1.users  table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(255) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'USER'
        CHECK (role IN ('USER', 'ADMIN')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 2. events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(255) NOT NULL,

    description TEXT NOT NULL,

    starts_at TIMESTAMPTZ NOT NULL,

    ends_at TIMESTAMPTZ NOT NULL,

    venue VARCHAR(255) NOT NULL,

    total_seats INTEGER NOT NULL
        CHECK (total_seats > 0),

    image_url TEXT,

    is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,

     is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_event_time
        CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_events_starts_at
ON events (starts_at);
CREATE INDEX IF NOT EXISTS idx_events_is_cancelled
ON events (is_cancelled);


-- 3. booking table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    event_id UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT,

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'CANCELLED')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


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
