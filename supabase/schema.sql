-- ==============================================================================
-- 🌙 DEENLY POSTGRESQL SCHEMA FOR SUPABASE (Safe & Re-runnable)
-- Copy and paste all of this into the Supabase SQL Editor and click "Run"
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  uid TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  photo_url TEXT,
  preferred_translation TEXT DEFAULT 'english',
  daily_goal_verses INTEGER DEFAULT 10,
  hasanat BIGINT DEFAULT 0,
  verses INTEGER DEFAULT 0,
  time INTEGER DEFAULT 0, -- Total reading time in seconds
  pages INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_read_surah INTEGER DEFAULT 1,
  last_read_ayah INTEGER DEFAULT 1,
  last_read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Clean and Recreate Security Policies (Safe)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

-- 5. Auto-Create Profile on Signup Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    uid,
    name,
    email,
    photo_url,
    preferred_translation,
    daily_goal_verses,
    hasanat,
    verses,
    time,
    pages,
    current_streak,
    best_streak,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.id::TEXT,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data->>'avatar_url',
    'english',
    10,
    0,
    0,
    0,
    0,
    0,
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Safe Realtime Replication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END $$;

-- 7. Additive Incremental Merge Function for Multi-Device Concurrency
CREATE OR REPLACE FUNCTION public.increment_user_stats(
  delta_hasanat BIGINT,
  delta_verses INTEGER,
  delta_time INTEGER,
  delta_pages INTEGER,
  surah_num INTEGER,
  ayah_num INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET
    hasanat = hasanat + delta_hasanat,
    verses = verses + delta_verses,
    time = time + delta_time,
    pages = pages + delta_pages,
    last_read_surah = surah_num,
    last_read_ayah = ayah_num,
    last_read_at = NOW(),
    updated_at = NOW()
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
