CREATE TABLE public.activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create','update','delete')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('dream','debt','goal')),
  entity_id UUID,
  entity_name TEXT NOT NULL DEFAULT '',
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own activity select" ON public.activity_log FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own activity insert" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own activity delete" ON public.activity_log FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX activity_log_user_created_idx ON public.activity_log(user_id, created_at DESC);