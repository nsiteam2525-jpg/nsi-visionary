ALTER TABLE public.dreams 
  ADD COLUMN IF NOT EXISTS is_achieved boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS achieved_at timestamptz;