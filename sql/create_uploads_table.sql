-- Run this in your Supabase SQL editor to create the uploads table
create table if not exists uploads (
  id uuid primary key,
  user_id uuid references auth.users(id),
  file_path text not null,
  description text,
  location text,
  corruption_type text,
  campaign_id uuid,
  campaign_type text,
  share_x boolean default false,
  share_instagram boolean default false,
  share_facebook boolean default false,
  is_anonymous boolean default true,
  reporter_name text,
  reporter_contact text,
  created_at timestamptz default now()
);

-- Recommended RLS (when you enable RLS):
-- Allow users to insert their own reports
-- create policy "Users can insert their own uploads" on uploads
-- for insert with check (auth.uid() = user_id);

-- Allow admins to read all (create admin policy separately)
