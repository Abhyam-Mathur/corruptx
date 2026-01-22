-- Run this in your Supabase SQL editor to create campaign_requests table
create table if not exists campaign_requests (
  id uuid primary key,
  user_id uuid references auth.users(id),
  title text not null,
  description text not null,
  location text,
  impact_summary text,
  created_at timestamptz default now(),
  status text default 'pending'
);

-- Consider RLS policies: only admins should update status; users may insert their own requests.
