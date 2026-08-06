const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockReset();
});

globalThis.fetch = fetchMock;
