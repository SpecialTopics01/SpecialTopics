# Emergency Connect - Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- `@supabase/supabase-js` - Database and auth
- `react-router-dom` - Routing
- `lucide-react` - Icons
- `@react-google-maps/api` - Google Maps
- `simple-peer` - WebRTC video calling

### 2. Supabase Database Setup

Your Supabase credentials are already configured in `lib/supabase.ts`.

#### Create Database Tables

Run this SQL in your Supabase SQL Editor (https://pdzttgkijnmhavckqpos.supabase.co):

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table profiles (
  id uuid references auth.users primary key,
  user_type text not null check (user_type in ('citizen', 'admin')),
  full_name text not null,
  email text not null,
  team text,
  location text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Emergency teams table
create table emergency_teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null check (type in ('police', 'fire', 'rescue')),
  location text not null,
  lat numeric not null,
  lng numeric not null,
  hotline text not null,
  created_at timestamp with time zone default now()
);

-- Call logs table
create table call_logs (
  id uuid primary key default uuid_generate_v4(),
  caller_id uuid references auth.users not null,
  receiver_id uuid references auth.users not null,
  team_id uuid references emergency_teams not null,
  start_time timestamp with time zone default now(),
  end_time timestamp with time zone,
  duration integer,
  status text not null default 'initiated' check (status in ('initiated', 'connected', 'ended', 'missed')),
  created_at timestamp with time zone default now()
);

-- Bookmarks table
create table bookmarks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  team_id uuid references emergency_teams not null,
  created_at timestamp with time zone default now(),
  unique(user_id, team_id)
);

-- Call signals table (for WebRTC signaling)
create table call_signals (
  id uuid primary key default uuid_generate_v4(),
  call_id uuid references call_logs(id) on delete cascade,
  caller_id uuid references auth.users not null,
  receiver_id uuid references auth.users not null,
  team_id uuid references emergency_teams,
  type text not null check (type in ('offer', 'answer', 'ice-candidate', 'end-call')),
  signal jsonb not null,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table emergency_teams enable row level security;
alter table call_logs enable row level security;
alter table bookmarks enable row level security;
alter table call_signals enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Service role can insert profiles"
  on profiles for insert
  with check (true);

-- Emergency teams policies (public read)
create policy "Anyone can view emergency teams"
  on emergency_teams for select
  to authenticated
  using (true);

-- Call logs policies
create policy "Users can view their own call logs"
  on call_logs for select
  using (auth.uid() = caller_id or auth.uid() = receiver_id);

create policy "Users can insert call logs"
  on call_logs for insert
  with check (auth.uid() = caller_id);

create policy "Users can update their own call logs"
  on call_logs for update
  using (auth.uid() = caller_id or auth.uid() = receiver_id);

-- Bookmarks policies
create policy "Users can view their own bookmarks"
  on bookmarks for select
  using (auth.uid() = user_id);

create policy "Users can manage their own bookmarks"
  on bookmarks for all
  using (auth.uid() = user_id);

-- Call signals policies
create policy "Users can view signals for their calls"
  on call_signals for select
  using (auth.uid() = caller_id or auth.uid() = receiver_id);

create policy "Users can insert signals for their calls"
  on call_signals for insert
  with check (auth.uid() = caller_id or auth.uid() = receiver_id);

-- Create indexes
create index idx_call_signals_call_id on call_signals(call_id);
create index idx_call_signals_created_at on call_signals(created_at desc);

-- Enable realtime for call_signals
alter publication supabase_realtime add table call_signals;
```

#### Seed Emergency Teams Data

Run the SQL from `database/seed-emergency-teams.sql` in your Supabase SQL Editor to populate emergency teams in Bukidnon.

### 3. Run the Application

```bash
npm run dev
```

## 🗺️ Features Implemented

### ✅ Phase 1 & 2 - Complete

**Authentication System:**
- Citizen registration/login
- Admin registration/login with team selection
- Protected routes
- Session persistence

**Google Maps Integration:**
- Interactive map centered on Bukidnon
- Emergency team markers (Police, Fire, Rescue)
- Custom colored markers for each team type
- Info windows with team details
- Distance calculation from user location
- Real-time location tracking

**Your Location Feature:**
- Automatic geolocation detection
- Real-time location updates
- Manual refresh option
- Displays coordinates

**Call History:**
- View all past emergency calls
- Shows call duration, status, and timestamps
- Filter by team type
- Detailed call information

**Bookmarks:**
- Save favorite emergency teams
- Quick access to saved teams
- One-tap calling from bookmarks
- Remove bookmarks easily

**WebRTC Video Calling:**
- Peer-to-peer video calls between citizens and admins
- Real-time audio and video
- Call controls (mute, video on/off, end call)
- Picture-in-picture local video
- Full-screen remote video
- Automatic call logging

## 📱 Testing the App

### As a Citizen:

1. **Register/Login**
   - Go to http://localhost:5173
   - Register with your details
   - Login to access dashboard

2. **View Your Location**
   - Allow browser location permissions
   - See your coordinates in the bottom panel
   - Tap to refresh location

3. **Make a Video Call**
   - Click any emergency team marker on the map
   - Click "Start Video Call"
   - Allow camera/microphone permissions
   - Wait for admin to answer

4. **View Call History**
   - Click "Call History" in bottom panel
   - See all your past calls
   - View call duration and status

5. **Bookmark Teams**
   - Click "Bookmarks" in bottom panel
   - Save your frequently contacted teams
   - Quick access for future calls

### As an Admin:

1. **Register/Login**
   - Go to http://localhost:5173/admin
   - Register with your team (Police, Fire, or Rescue)
   - Login to access dashboard

2. **Receive Calls**
   - Wait for incoming calls from citizens
   - Accept or reject calls
   - View caller information

3. **Manage Call Logs**
   - View all received calls
   - See call statistics
   - Generate monthly reports

## 🔑 API Keys

- **Supabase URL**: https://pdzttgkijnmhavckqpos.supabase.co
- **Google Maps API Key**: AIzaSyBUV8Ag1aOioVL3SErpMIItjsGAbnE9sR4

Both are configured in `lib/supabase.ts`.

## 🏗️ Project Structure

```
src/
├── components/
│   ├── AuthLayout.tsx          # Auth page wrapper
│   ├── Button.tsx              # Reusable button
│   ├── Input.tsx               # Reusable input
│   ├── MapView.tsx             # Google Maps integration
│   ├── ProtectedRoute.tsx      # Route protection
│   ├── VideoCallModal.tsx      # Video call UI
│   ├── CallHistoryModal.tsx    # Call history display
│   └── BookmarksModal.tsx      # Bookmarks display
├── contexts/
│   └── AuthContext.tsx         # Authentication state
├── hooks/
│   ├── useEmergencyTeams.ts    # Fetch emergency teams
│   ├── useGeolocation.ts       # Get user location
│   ├── useCallHistory.ts       # Fetch call logs
│   ├── useBookmarks.ts         # Manage bookmarks
│   └── useWebRTC.ts            # WebRTC connection logic
├── lib/
│   └── supabase.ts             # Supabase client config
├── pages/
│   ├── AdminAuth.tsx           # Admin login/register
│   ├── AdminDashboard.tsx      # Admin interface
│   ├── CitizenAuth.tsx         # Citizen login/register
│   └── CitizenDashboard.tsx    # Citizen interface
├── types/
│   ├── database.ts             # Database types
│   └── webrtc.ts               # WebRTC types
├── utils/
│   └── mapHelpers.ts           # Map utilities
└── App.tsx                     # Main app with routing
```

## 🐛 Troubleshooting

### Camera/Microphone not working?
- Check browser permissions
- Ensure HTTPS or localhost
- Try different browser

### Video call not connecting?
- Check internet connection
- Verify both users are online
- Check browser console for errors
- Ensure call_signals table has realtime enabled

### Location not updating?
- Allow browser location permissions
- Check if GPS is enabled
- Try manual refresh

### Map not loading?
- Check browser console for errors
- Verify Google Maps API key is valid
- Ensure internet connection

## 🔒 Security Notes

- All video calls are peer-to-peer (P2P)
- No video data stored on servers
- Call metadata logged for history
- Location data only used for distance calculation
- Supabase RLS policies protect user data

## 📞 WebRTC Architecture

The app uses WebRTC for direct peer-to-peer video calls:

1. **Signaling**: Supabase Realtime handles SDP exchange
2. **STUN Servers**: Google's public STUN servers for NAT traversal
3. **Media**: Direct P2P connection between browsers
4. **Fallback**: TURN servers may be needed for restrictive networks (not included)

For production, consider adding TURN servers for better connectivity.