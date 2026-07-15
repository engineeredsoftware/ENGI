// Passive stand-in for `@vercel/analytics` in jest: jsdom's `browser` export
// condition would otherwise resolve the untransformed ESM build. Tests that
// assert tracking calls replace this with `jest.mock('@vercel/analytics', …)`.
export const track = (): void => {};
