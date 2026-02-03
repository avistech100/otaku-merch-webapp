-- Create storage buckets
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('store-assets', 'store-assets', true)
on conflict (id) do nothing;

-- Set up RLS for storage.objects
-- Note: storage.objects RLS refers to the bucket_id and name

-- 1. Avatars Policies
-- Allow public to view avatars
create policy "Public Access to Avatars"
on storage.objects for select
using ( bucket_id = 'avatars' );

-- Allow authenticated users to upload their own avatar
-- The filename format is userId-timestamp.ext, so we check if the name starts with auth.uid()
create policy "Users can upload their own avatar"
on storage.objects for insert
with check (
  bucket_id = 'avatars' 
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = 'avatars'
  -- Note: imageUpload.ts uses filePath = `avatars/${fileName}` where fileName starts with userId
  -- So storage.foldername(name) will be ['avatars'] and the actual name is 'avatars/userId-timestamp.ext'
);

-- Simpler policy for development if the above folder logic is complex:
drop policy if exists "Authenticated users can upload avatars" on storage.objects;
create policy "Authenticated users can upload avatars"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'avatars' );

create policy "Authenticated users can update their avatars"
on storage.objects for update
to authenticated
using ( bucket_id = 'avatars' );

create policy "Authenticated users can delete their avatars"
on storage.objects for delete
to authenticated
using ( bucket_id = 'avatars' );


-- 2. Product Images Policies
create policy "Public Access to Product Images"
on storage.objects for select
using ( bucket_id = 'product-images' );

create policy "Creators can upload product images"
on storage.objects for insert
to authenticated
with check ( 
  bucket_id = 'product-images' 
  and exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('creator', 'admin')
  )
);

create policy "Creators can update product images"
on storage.objects for update
to authenticated
using ( 
  bucket_id = 'product-images' 
  and exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('creator', 'admin')
  )
);

create policy "Creators can delete product images"
on storage.objects for delete
to authenticated
using ( 
  bucket_id = 'product-images' 
  and exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('creator', 'admin')
  )
);


-- 3. Store Assets Policies (Logos, Banners)
create policy "Public Access to Store Assets"
on storage.objects for select
using ( bucket_id = 'store-assets' );

create policy "Creators can upload store assets"
on storage.objects for insert
to authenticated
with check ( 
  bucket_id = 'store-assets' 
  and exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('creator', 'admin')
  )
);

create policy "Creators can update store assets"
on storage.objects for update
to authenticated
using ( 
  bucket_id = 'store-assets' 
  and exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('creator', 'admin')
  )
);

create policy "Creators can delete store assets"
on storage.objects for delete
to authenticated
using ( 
  bucket_id = 'store-assets' 
  and exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('creator', 'admin')
  )
);
