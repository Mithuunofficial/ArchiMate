-- ArchiMate Supabase PostgreSQL Database Schema (Updated for Dual-Method Approval & RBAC)
-- Run this script in your Supabase SQL Editor to set up tables, roles, dual-approval status, audit logs, and RLS policies.

-- -------------------------------------------------------
-- 1. PROFILES TABLE
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user' NOT NULL,
  status TEXT CHECK (status IN ('active', 'suspended', 'pending', 'approved', 'rejected')) DEFAULT 'pending' NOT NULL,
  email_verified BOOLEAN DEFAULT false NOT NULL,
  admin_approved BOOLEAN DEFAULT false NOT NULL,
  account_status TEXT CHECK (account_status IN ('pending', 'approved', 'rejected', 'suspended')) DEFAULT 'pending' NOT NULL,
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_by TEXT,
  rejected_at TIMESTAMP WITH TIME ZONE,
  suspended_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add missing columns if upgrading existing table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user' NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='status') THEN
    ALTER TABLE public.profiles ADD COLUMN status TEXT DEFAULT 'pending' NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='email_verified') THEN
    ALTER TABLE public.profiles ADD COLUMN email_verified BOOLEAN DEFAULT false NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='admin_approved') THEN
    ALTER TABLE public.profiles ADD COLUMN admin_approved BOOLEAN DEFAULT false NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='account_status') THEN
    ALTER TABLE public.profiles ADD COLUMN account_status TEXT CHECK (account_status IN ('pending', 'approved', 'rejected', 'suspended')) DEFAULT 'pending' NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='approved_by') THEN
    ALTER TABLE public.profiles ADD COLUMN approved_by TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='approved_at') THEN
    ALTER TABLE public.profiles ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='rejected_by') THEN
    ALTER TABLE public.profiles ADD COLUMN rejected_by TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='rejected_at') THEN
    ALTER TABLE public.profiles ADD COLUMN rejected_at TIMESTAMP WITH TIME ZONE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='suspended_at') THEN
    ALTER TABLE public.profiles ADD COLUMN suspended_at TIMESTAMP WITH TIME ZONE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='rejection_reason') THEN
    ALTER TABLE public.profiles ADD COLUMN rejection_reason TEXT;
  END IF;
END $$;

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- -------------------------------------------------------
-- 2. PROJECTS TABLE
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
  project_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  tech_stack TEXT[] DEFAULT '{}',
  architecture JSONB NOT NULL DEFAULT '{}'::jsonb,
  node_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Helper condition check for approved user:
-- account_status NOT IN ('suspended', 'rejected') AND (email_verified OR admin_approved)

DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
CREATE POLICY "Users can view their own projects"
  ON public.projects FOR SELECT
  USING (
    (
      auth.uid() = user_id AND (
        (SELECT account_status FROM public.profiles WHERE id = auth.uid()) NOT IN ('suspended', 'rejected')
        AND (
          (SELECT email_verified FROM public.profiles WHERE id = auth.uid()) = true
          OR (SELECT admin_approved FROM public.profiles WHERE id = auth.uid()) = true
        )
      )
    )
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "Users can insert their own projects" ON public.projects;
CREATE POLICY "Users can insert their own projects"
  ON public.projects FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND (
      (SELECT account_status FROM public.profiles WHERE id = auth.uid()) NOT IN ('suspended', 'rejected')
      AND (
        (SELECT email_verified FROM public.profiles WHERE id = auth.uid()) = true
        OR (SELECT admin_approved FROM public.profiles WHERE id = auth.uid()) = true
      )
    )
  );

DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE
  USING (
    auth.uid() = user_id AND (
      (SELECT account_status FROM public.profiles WHERE id = auth.uid()) NOT IN ('suspended', 'rejected')
      AND (
        (SELECT email_verified FROM public.profiles WHERE id = auth.uid()) = true
        OR (SELECT admin_approved FROM public.profiles WHERE id = auth.uid()) = true
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE
  USING (
    (
      auth.uid() = user_id AND (
        (SELECT account_status FROM public.profiles WHERE id = auth.uid()) NOT IN ('suspended', 'rejected')
        AND (
          (SELECT email_verified FROM public.profiles WHERE id = auth.uid()) = true
          OR (SELECT admin_approved FROM public.profiles WHERE id = auth.uid()) = true
        )
      )
    )
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- -------------------------------------------------------
-- 3. ADMIN ACTIVITY LOGS TABLE
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_username TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT DEFAULT 'system',
  target_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on admin_activity_logs
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Only Admins can view activity logs
DROP POLICY IF EXISTS "Admins can view activity logs" ON public.admin_activity_logs;
CREATE POLICY "Admins can view activity logs"
  ON public.admin_activity_logs FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- -------------------------------------------------------
-- 4. AUTOMATIC PROFILE CREATION TRIGGER
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    email,
    role,
    status,
    account_status,
    email_verified,
    admin_approved,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    'pending',
    'pending',
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    username = COALESCE(EXCLUDED.username, public.profiles.username),
    email = EXCLUDED.email,
    email_verified = COALESCE(NEW.email_confirmed_at IS NOT NULL, public.profiles.email_verified),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
