// Mock Firebase config for tests — avoids import.meta.env, which Jest can't parse
export const auth = {
  currentUser: null,
  onAuthStateChanged: jest.fn(),
  signOut: jest.fn(() => Promise.resolve()),
};

export const db = {};

export default {};
