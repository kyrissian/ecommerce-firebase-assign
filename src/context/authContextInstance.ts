import { createContext } from "react";
import type { User } from "firebase/auth";

/**
 * Extra profile data pulled from Firestore's "users" collection, on top
 * of what Firebase Auth's User object already provides.
 */
export interface UserProfile {
  role: string;
  address?: string;
  phone?: string;
}

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  authLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: (_user: User | null) => {},
  profile: null,
  setProfile: (_profile: UserProfile | null) => {},
  authLoading: true,
});

/**
 * Split into its own file (separate from AuthContext.tsx, which holds
 * the actual AuthProvider component) so useAuth.ts can import just the
 * context object without pulling in the whole provider -- keeps Fast
 * Refresh happy, same pattern already used for Cart and Product contexts.
 */
export default AuthContext;
