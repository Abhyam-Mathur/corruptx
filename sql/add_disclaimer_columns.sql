-- Add disclaimer acceptance columns to profiles table
-- Run this in your Supabase SQL editor

alter table profiles
add column if not exists disclaimer_accepted boolean default false,
add column if not exists disclaimer_accepted_at timestamp;