alter table public.profiles
  add column if not exists gender text,
  add column if not exists relationship_status text,
  add column if not exists birthday date,
  add column if not exists anniversary_date date,
  add column if not exists avatar_url text,
  add column if not exists avatar_path text,
  add column if not exists celebration_opt_in boolean not null default true,
  add column if not exists greeting_last_seen_on date,
  add column if not exists password_changed_at timestamp with time zone;

create table if not exists public.user_celebration_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  event_type text not null,
  event_date date not null,
  acknowledged_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint user_celebration_events_event_type_check check (event_type in ('birthday','anniversary')),
  constraint user_celebration_events_user_event_unique unique (user_id, event_type, event_date)
);

create table if not exists public.user_email_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  event_type text not null,
  recipient_email text not null,
  status text not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  scheduled_for timestamp with time zone,
  sent_at timestamp with time zone,
  error_message text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint user_email_events_event_type_check check (event_type in ('password_changed','birthday_greeting','anniversary_greeting','dream_created','dream_achieved')),
  constraint user_email_events_status_check check (status in ('pending','queued','sent','failed'))
);

create table if not exists public.user_greeting_schedule (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  next_run_at timestamp with time zone,
  timezone text not null default 'Asia/Kolkata',
  last_processed_for date,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.user_celebration_events enable row level security;
alter table public.user_email_events enable row level security;
alter table public.user_greeting_schedule enable row level security;

create policy "Users can view their own celebration events"
on public.user_celebration_events
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create their own celebration events"
on public.user_celebration_events
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own celebration events"
on public.user_celebration_events
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own celebration events"
on public.user_celebration_events
for delete
to authenticated
using (auth.uid() = user_id);

create policy "Users can view their own email events"
on public.user_email_events
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create their own email events"
on public.user_email_events
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own email events"
on public.user_email_events
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own email events"
on public.user_email_events
for delete
to authenticated
using (auth.uid() = user_id);

create policy "Users can view their own greeting schedule"
on public.user_greeting_schedule
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create their own greeting schedule"
on public.user_greeting_schedule
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own greeting schedule"
on public.user_greeting_schedule
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own greeting schedule"
on public.user_greeting_schedule
for delete
to authenticated
using (auth.uid() = user_id);

create index if not exists idx_user_celebration_events_user_date on public.user_celebration_events (user_id, event_date desc);
create index if not exists idx_user_email_events_user_status on public.user_email_events (user_id, status, scheduled_for);
create index if not exists idx_user_greeting_schedule_next_run on public.user_greeting_schedule (next_run_at);

create or replace function public.queue_daily_greeting_events(_run_date date default (now() at time zone 'Asia/Kolkata')::date)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_email_events (user_id, event_type, recipient_email, status, payload, scheduled_for)
  select
    p.user_id,
    case
      when p.birthday is not null
        and extract(month from p.birthday) = extract(month from _run_date)
        and extract(day from p.birthday) = extract(day from _run_date)
      then 'birthday_greeting'
      else 'anniversary_greeting'
    end,
    au.email,
    'pending',
    jsonb_build_object(
      'full_name', coalesce(nullif(p.full_name, ''), nullif(p.nickname, ''), 'Dreamer'),
      'avatar_url', p.avatar_url,
      'birthday', p.birthday,
      'anniversary_date', p.anniversary_date,
      'relationship_status', p.relationship_status
    ),
    timezone('UTC', date_trunc('day', (_run_date::timestamp + interval '5 hours')))
  from public.profiles p
  join auth.users au on au.id = p.user_id
  where p.celebration_opt_in = true
    and (
      (p.birthday is not null
        and extract(month from p.birthday) = extract(month from _run_date)
        and extract(day from p.birthday) = extract(day from _run_date))
      or
      (p.relationship_status = 'married'
        and p.anniversary_date is not null
        and extract(month from p.anniversary_date) = extract(month from _run_date)
        and extract(day from p.anniversary_date) = extract(day from _run_date))
    )
    and not exists (
      select 1
      from public.user_email_events e
      where e.user_id = p.user_id
        and e.event_type = case
          when p.birthday is not null
            and extract(month from p.birthday) = extract(month from _run_date)
            and extract(day from p.birthday) = extract(day from _run_date)
          then 'birthday_greeting'
          else 'anniversary_greeting'
        end
        and e.scheduled_for::date = _run_date
    );
end;
$$;

create trigger touch_user_celebration_events_updated_at
before update on public.user_celebration_events
for each row
execute function public.touch_updated_at();

create trigger touch_user_email_events_updated_at
before update on public.user_email_events
for each row
execute function public.touch_updated_at();

create trigger touch_user_greeting_schedule_updated_at
before update on public.user_greeting_schedule
for each row
execute function public.touch_updated_at();