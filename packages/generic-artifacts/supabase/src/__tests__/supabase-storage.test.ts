import {
  createSupabaseArtifactStorage,
  isSupabaseArtifactStorageConfigured,
} from '../index';

describe('generic-artifacts-supabase', () => {
  const prevUrl = process.env.SUPABASE_URL;
  const prevKey = process.env.SUPABASE_ANON_KEY;
  const prevPub = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  afterEach(() => {
    if (prevUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = prevUrl;
    if (prevKey === undefined) delete process.env.SUPABASE_ANON_KEY;
    else process.env.SUPABASE_ANON_KEY = prevKey;
    if (prevPub === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = prevPub;
  });

  it('reports unconfigured without url/key', () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(isSupabaseArtifactStorageConfigured()).toBe(false);
    expect(createSupabaseArtifactStorage()).toBeNull();
  });

  it('creates storage when configured', () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-key';
    expect(isSupabaseArtifactStorageConfigured()).toBe(true);
    const storage = createSupabaseArtifactStorage();
    expect(storage).not.toBeNull();
  });
});
