# Emergency Connect - Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js react-router-dom lucide-react @react-google-maps/api
```

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

-- Enable Row Level Security
alter table profiles enable row level security;
alter table emergency_teams enable row level security;
alter table call_logs enable row level security;
alter table bookmarks enable row level security;

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

-- Bookmarks policies
create policy "Users can view their own bookmarks"
  on bookmarks for select
  using (auth.uid() = user_id);

create policy "Users can manage their own bookmarks"
  on bookmarks for all
  using (auth.uid() = user_id);
```

#### Seed Emergency Teams Data

Run the SQL from `database/seed-emergency-teams.sql` in your Supabase SQL Editor to populate emergency teams in Bukidnon.

### 3. Run the Application

```bash
npm run dev
```

## 🗺️ Features Implemented

### ✅ Phase 1 - Complete
- **Authentication System**
  - Citizen registration/login
  - Admin registration/login with team selection
  - Protected routes
  - Session persistence

- **Google Maps Integration**
  - Interactive map centered on Bukidnon
  - Emergency team markers (Police, Fire, Rescue)
  - Custom colored markers for each team type
  - Info windows with team details
  - Distance calculation from user location
  - "Start Video Call" button (UI ready, functionality next phase)

- **User Interfaces**
  - Citizen Dashboard (mobile-first, emergency-focused)
  - Admin Dashboard (desktop-optimized, professional)
  - Responsive design for all screen sizes

## 🔜 Next Phase

- WebRTC video calling implementation
- Real-time call logging
- Call history display
- Bookmark functionality
- Admin analytics and monthly reports
- Push notifications for incoming calls

## 📱 Testing the App

1. **Register as a Citizen**
   - Go to http://localhost:5173
   - Click "Register"
   - Fill in your details
   - Login and view the dashboard

2. **View Emergency Map**
   - Click "View Emergency Map" on the citizen dashboard
   - See all emergency teams in Bukidnon
   - Click any marker to see team details
   - Click "Start Video Call" (will show alert - functionality coming next)

3. **Register as an Admin**
   - Go to http://localhost:5173/admin
   - Register with a team (Police, Fire, or Rescue)
   - Login to see the admin dashboard

## 🔑 API Keys

- **Supabase URL**: https://pdzttgkijnmhavckqpos.supabase.co
- **Google Maps API Key**: AIzaSyBUV8Ag1aOioVL3SErpMIItjsGAbnE9sR4

Both are configured in `lib/supabase.ts`.

## 🏗️ Project Structure

```
src/
├── components/
│   ├── AuthLayout.tsx       # Auth page wrapper
│   ├── Button.tsx           # Reusable button component
│   ├── Input.tsx            # Reusable input component
│   ├── MapView.tsx          # Google Maps integration
│   └── ProtectedRoute.tsx   # Route protection
├── contexts/
│   └── AuthContext.tsx      # Authentication state
├── hooks/
│   └── useEmergencyTeams.ts # Fetch emergency teams
├── lib/
│   └── supabase.ts          # Supabase client config
├── pages/
│   ├── AdminAuth.tsx        # Admin login/register
│   ├── AdminDashboard.tsx   # Admin interface
│   ├── CitizenAuth.tsx      # Citizen login/register
│   └── CitizenDashboard.tsx # Citizen interface
├── types/
│   └── database.ts          # TypeScript types
├── utils/
│   └── mapHelpers.ts        # Map utilities
└── App.tsx                  # Main app with routing
```

## 🐛 Troubleshooting

### Map not loading?
- Check browser console for errors
- Verify Google Maps API key is valid
- Ensure you have internet connection

### Can't login?
- Check Supabase dashboard for user creation
- Verify database tables exist
- Check browser console for errors

### No emergency teams showing?
- Run the seed SQL script in Supabase
- Check emergency_teams table has data
- Verify RLS policies are set correctly
