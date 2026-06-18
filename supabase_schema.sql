-- ====================================================================
-- CONSISTENCY TRACKER - DETAILED SUPABASE DB SCHEMA & DATABASE POLICIES
-- ====================================================================
-- This script sets up profiles, tasks, missions, achievements, and claims.
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard).

-- --------------------------------------------------------------------
-- 1. CLEANUP (Optional / Development Mode)
-- --------------------------------------------------------------------
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user();
-- DROP TABLE IF EXISTS public.reward_claims CASCADE;
-- DROP TABLE IF EXISTS public.achievements CASCADE;
-- DROP TABLE IF EXISTS public.tasks CASCADE;
-- DROP TABLE IF EXISTS public.missions CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;

-- Enable UUID extension if not already ready
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 2. TABLES CREATION
-- --------------------------------------------------------------------

-- Profile Table (linked to Supabase Auth user)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    streak_count INTEGER DEFAULT 0 NOT NULL,
    total_tasks_completed INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tasks Table (user task tracking)
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    priority TEXT DEFAULT 'medium'::text NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_priority CHECK (priority IN ('low', 'medium', 'high'))
);

-- Gamified Missions Table (Predefined system missions - Static)
CREATE TABLE public.missions (
    key TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('login_streak', 'task_streak', 'total_tasks', 'consistency')),
    target INTEGER NOT NULL CHECK (target > 0),
    badge_name TEXT NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'diamond', 'legendary', 'champion')),
    icon TEXT NOT NULL,
    sort_order INTEGER DEFAULT 100 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Achievements Table (unlocked missions per user)
CREATE TABLE public.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mission_key TEXT NOT NULL REFERENCES public.missions(key) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0 NOT NULL,
    is_claimed BOOLEAN DEFAULT FALSE NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (user_id, mission_key)
);

-- Reward Claims / Claim Achievement Table
CREATE TABLE public.reward_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    reward_type TEXT DEFAULT 'badge'::text NOT NULL,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (user_id, achievement_id)
);

-- --------------------------------------------------------------------
-- 3. PER-TABLE PERFORMANCE INDEXES
-- --------------------------------------------------------------------
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_created_at ON public.tasks(created_at);
CREATE INDEX idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX idx_achievements_mission_key ON public.achievements(mission_key);
CREATE INDEX idx_reward_claims_user_id ON public.reward_claims(user_id);

-- --------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------

-- Enable Row Level Security on all operational tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_claims ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are accessible to their respective owner"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can edit their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Tasks Policies
CREATE POLICY "Users can view their own tasks only"
    ON public.tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks"
    ON public.tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify their own tasks"
    ON public.tasks FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
    ON public.tasks FOR DELETE
    USING (auth.uid() = user_id);

-- Missions Policies (Missions are public read-only system configurations)
CREATE POLICY "Missions are visible to everyone"
    ON public.missions FOR SELECT
    TO PUBLIC
    USING (true);

-- Achievements Policies
CREATE POLICY "Users can view their own achievements"
    ON public.achievements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert achievements for themselves"
    ON public.achievements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
    ON public.achievements FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Reward Claims Policies
CREATE POLICY "Users can view their own reward claims"
    ON public.reward_claims FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can claim achievements for themselves"
    ON public.reward_claims FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- 5. AUTOMATIC PROFILE INITIALIZATION (Supabase Auth Hook Trigger)
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, streak_count, total_tasks_completed)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.raw_user_meta_data->>'avatar_url',
        0,
        0
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the trigger function on new auth.users creates
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------------------------
-- 6. EXACT SYSTEM MISSIONS DATA SEEDING
-- --------------------------------------------------------------------
INSERT INTO public.missions (key, title, description, category, target, badge_name, tier, icon, sort_order) VALUES
('login_1','First Step','Login and complete at least one task for 1 day','login_streak',1,'Bronze Flame','bronze','flame',10),
('login_5','Consistent Starter','Login and complete a task for 5 consecutive days','login_streak',5,'Consistent Starter','bronze','flame',11),
('login_7','Weekly Warrior','Login and complete a task for 7 consecutive days','login_streak',7,'Weekly Warrior','silver','flame',12),
('login_10','Focused Mind','Login and complete a task for 10 consecutive days','login_streak',10,'Focused Mind','silver','flame',13),
('login_15','Half Month Hero','Login and complete a task for 15 consecutive days','login_streak',15,'Half Month Hero','gold','flame',14),
('login_30','Monthly Master','Login and complete a task for 30 consecutive days','login_streak',30,'Monthly Master','gold','flame',15),
('login_90','Quarter Champion','Login and complete a task for 90 consecutive days','login_streak',90,'Quarter Champion','diamond','gem',16),
('login_180','Half Year Legend','Login and complete a task for 180 consecutive days','login_streak',180,'Half Year Legend','legendary','crown',17),
('login_365','Discipline King','Login and complete a task for 365 consecutive days','login_streak',365,'Discipline King','champion','trophy',18),
('task_5','Beginner','Complete all planned tasks for 5 days in a row','task_streak',5,'Beginner','bronze','sprout',20),
('task_10','Dedicated','Complete all planned tasks for 10 days in a row','task_streak',10,'Dedicated','silver','zap',21),
('task_20','Focus Machine','Complete all planned tasks for 20 days in a row','task_streak',20,'Focus Machine','silver','flame',22),
('task_30','Discipline Builder','Complete all planned tasks for 30 days in a row','task_streak',30,'Discipline Builder','gold','shield',23),
('task_50','Iron Will','Complete all planned tasks for 50 days in a row','task_streak',50,'Iron Will','gold','dumbbell',24),
('task_100','Unbreakable','Complete all planned tasks for 100 days in a row','task_streak',100,'Unbreakable','diamond','rocket',25),
('task_365','Legendary','Complete all planned tasks for 365 days in a row','task_streak',365,'Legendary','legendary','star',26),
('total_10','First Victory','Complete a total of 10 tasks','total_tasks',10,'First Victory','bronze','book',30),
('total_25','Productive','Complete a total of 25 tasks','total_tasks',25,'Productive','bronze','book',31),
('total_50','Achiever','Complete a total of 50 tasks','total_tasks',50,'Achiever','silver','book',32),
('total_100','Performer','Complete a total of 100 tasks','total_tasks',100,'Performer','silver','book',33),
('total_250','Elite','Complete a total of 250 tasks','total_tasks',250,'Elite','diamond','gem',34),
('total_500','Master','Complete a total of 500 tasks','total_tasks',500,'Master','legendary','crown',35),
('total_1000','Grandmaster','Complete a total of 1000 tasks','total_tasks',1000,'Grandmaster','champion','trophy',36),
('cons_once','Green Start','Reach 100% daily consistency once','consistency',1,'Green Start','bronze','circle-check',40),
('cons_7','Perfect Week','Maintain 100% consistency for 7 days','consistency',7,'Perfect Week','silver','sparkles',41),
('cons_30','Perfect Month','Maintain 100% consistency for 30 days','consistency',30,'Perfect Month','gold','star',42),
('cons_100','Consistency Legend','Maintain 100% consistency for 100 days','consistency',100,'Consistency Legend','legendary','galaxy',43)
ON CONFLICT (key) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    target = EXCLUDED.target,
    badge_name = EXCLUDED.badge_name,
    tier = EXCLUDED.tier,
    icon = EXCLUDED.icon,
    sort_order = EXCLUDED.sort_order;
