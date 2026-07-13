/**
 * Shared sats-connect mock for uapi Jest.
 * packages/auth and uapi resolve different pnpm physical paths for sats-connect;
 * mapping the package name here forces one mock for both.
 */
const mockGetProviders = jest.fn(() => []);
const mockRequest = jest.fn();

module.exports = {
  getProviders: (...args) => mockGetProviders(...args),
  request: (...args) => mockRequest(...args),
  __mockGetProviders: mockGetProviders,
  __mockRequest: mockRequest,
};
