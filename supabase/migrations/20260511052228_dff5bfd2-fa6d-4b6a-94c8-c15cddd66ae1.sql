
CREATE TABLE public.dream_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  dream_id uuid,
  dream_text text NOT NULL,
  plan jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.dream_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own dream_plans select" ON public.dream_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own dream_plans insert" ON public.dream_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own dream_plans update" ON public.dream_plans FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own dream_plans delete" ON public.dream_plans FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER dream_plans_touch BEFORE UPDATE ON public.dream_plans FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.motivation_preferences (
  user_id uuid PRIMARY KEY,
  channels jsonb NOT NULL DEFAULT '{"in_app":true,"push":false,"whatsapp":false,"voice":false,"email":false}'::jsonb,
  best_time text NOT NULL DEFAULT 'morning',
  harder_when_idle boolean NOT NULL DEFAULT false,
  frequency text NOT NULL DEFAULT 'daily',
  phone text,
  email text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.motivation_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own motiv select" ON public.motivation_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own motiv insert" ON public.motivation_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own motiv update" ON public.motivation_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own motiv delete" ON public.motivation_preferences FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER motivation_preferences_touch BEFORE UPDATE ON public.motivation_preferences FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
