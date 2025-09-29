-- Drop all existing tables and start fresh
DROP TABLE IF EXISTS public.browser_tabs CASCADE;
DROP TABLE IF EXISTS public.browsing_sessions CASCADE;
DROP TABLE IF EXISTS public.browsing_history CASCADE;
DROP TABLE IF EXISTS public.bookmarks CASCADE;
DROP TABLE IF EXISTS public.browser_profiles CASCADE;

-- Drop the update function as well
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;