-- Raw AssetPack artifact store (decided 2026-07-05, qa/BITCODE_V48_QA.md §
-- "Raw AssetPack artifact storage"): artifacts are ALWAYS .patch files in the
-- PRIVATE `asset-pack-artifacts` file bucket at
-- `<user_id>/<run_id>/<option_id>.patch`. Owner-only RLS; buyers receive
-- post-settlement signed URLs minted server-side (service role bypasses RLS).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'asset-pack-artifacts',
  'asset-pack-artifacts',
  false,
  10485760, -- 10 MiB per patch artifact
  array['text/x-patch', 'text/plain']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'asset_pack_artifacts_owner_insert'
  ) then
    create policy "asset_pack_artifacts_owner_insert"
      on storage.objects for insert to authenticated
      with check (
        bucket_id = 'asset-pack-artifacts'
        and (storage.foldername(name))[1] = auth.uid()::text
        and storage.extension(name) = 'patch'
      );
  end if;

  if not exists (
    select from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'asset_pack_artifacts_owner_select'
  ) then
    create policy "asset_pack_artifacts_owner_select"
      on storage.objects for select to authenticated
      using (
        bucket_id = 'asset-pack-artifacts'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;

  if not exists (
    select from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'asset_pack_artifacts_owner_delete'
  ) then
    create policy "asset_pack_artifacts_owner_delete"
      on storage.objects for delete to authenticated
      using (
        bucket_id = 'asset-pack-artifacts'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end
$$;
