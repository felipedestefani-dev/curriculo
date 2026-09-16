-- Cole este arquivo no SQL Editor do Supabase e clique em Run.
-- Depois crie um usuário em Authentication com o e-mail abaixo
-- e desative o cadastro público.

create table if not exists public.site_content (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;

drop policy if exists "public read site_content" on public.site_content;
drop policy if exists "owner write site_content" on public.site_content;

create policy "public read site_content"
  on public.site_content
  for select
  to anon, authenticated
  using (true);

create policy "owner write site_content"
  on public.site_content
  for all
  to authenticated
  using ((auth.jwt() ->> 'email') = 'felipedestefanidasilva@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'felipedestefanidasilva@gmail.com');

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "public read photos" on storage.objects;
drop policy if exists "owner upload photos" on storage.objects;
drop policy if exists "owner update photos" on storage.objects;
drop policy if exists "owner delete photos" on storage.objects;

create policy "public read photos"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'photos');

create policy "owner upload photos"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'photos'
    and (auth.jwt() ->> 'email') = 'felipedestefanidasilva@gmail.com'
  );

create policy "owner update photos"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'photos'
    and (auth.jwt() ->> 'email') = 'felipedestefanidasilva@gmail.com'
  );

create policy "owner delete photos"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'photos'
    and (auth.jwt() ->> 'email') = 'felipedestefanidasilva@gmail.com'
  );
