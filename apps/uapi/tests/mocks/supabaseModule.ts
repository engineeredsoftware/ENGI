const supabaseAdmin = {
  rpc: jest.fn(async () => ({ data: [], error: null })),
  from: jest.fn()
};

const supabase = supabaseAdmin;

export { supabaseAdmin, supabase };
