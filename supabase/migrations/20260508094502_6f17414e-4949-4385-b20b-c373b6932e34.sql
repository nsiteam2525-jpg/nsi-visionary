
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT DEFAULT '',
  nickname TEXT DEFAULT '',
  city TEXT DEFAULT '',
  age INTEGER,
  monthly_income NUMERIC DEFAULT 0,
  savings NUMERIC DEFAULT 0,
  retirement_age INTEGER,
  motivation TEXT DEFAULT '',
  onboarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own profile delete" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Dreams
CREATE TABLE public.dreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('short','medium','long')),
  amount NUMERIC NOT NULL DEFAULT 0,
  deadline_years NUMERIC NOT NULL DEFAULT 1,
  priority SMALLINT NOT NULL DEFAULT 2,
  why TEXT DEFAULT '',
  saved NUMERIC NOT NULL DEFAULT 0,
  emoji TEXT DEFAULT '✨',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dreams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own dreams select" ON public.dreams FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own dreams insert" ON public.dreams FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own dreams update" ON public.dreams FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own dreams delete" ON public.dreams FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_dreams_user ON public.dreams(user_id);

-- Debts
CREATE TABLE public.debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Bank',
  amount NUMERIC NOT NULL DEFAULT 0,
  emi NUMERIC NOT NULL DEFAULT 0,
  interest NUMERIC NOT NULL DEFAULT 0,
  stress SMALLINT NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own debts select" ON public.debts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own debts insert" ON public.debts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own debts update" ON public.debts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own debts delete" ON public.debts FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_debts_user ON public.debts(user_id);

-- Other goals
CREATE TABLE public.other_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Family',
  amount NUMERIC NOT NULL DEFAULT 0,
  priority SMALLINT NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.other_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own goals select" ON public.other_goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own goals insert" ON public.other_goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own goals update" ON public.other_goals FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own goals delete" ON public.other_goals FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_goals_user ON public.other_goals(user_id);

-- updated_at trigger function
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER dreams_touch BEFORE UPDATE ON public.dreams FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER debts_touch BEFORE UPDATE ON public.debts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER goals_touch BEFORE UPDATE ON public.other_goals FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
