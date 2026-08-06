const createClient = jest.fn(async () => ({
  auth: {
    getUser: async () => ({ data: { user: null }, error: null })
  }
}));

export { createClient };
