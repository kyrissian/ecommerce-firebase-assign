import {
  createContext,
  useState,
  useEffect,
  useContext,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

/**
 * Extra profile data pulled from Firestore's "users" collection, on top
 * of what Firebase Auth's User object already provides. role is always
 * set (Register.tsx assigns "customer" to every new signup); address
 * and phone are optional since they're only set once someone fills
 * them in via Profile or during checkout.
 */
interface UserProfile {
  role: string;
  address?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  profile: UserProfile | null;
  /** Lets other components update the in-memory profile immediately
   * after writing changes to Firestore, so the UI reflects the change
   * right away instead of showing stale data until the next login. */
  setProfile: (profile: UserProfile | null) => void;
  /** True until Firebase has resolved whether someone is logged in or not.
   * Prevents things like ProtectedRoute from redirecting prematurely,
   * before we actually know the real auth state. */
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
 * Provides the app's authentication state: who's logged in (via Firebase
 * Auth), their Firestore profile data (role, address, phone), and
 * whether that information has finished loading yet.
 *
 * Listens to Firebase Auth's onAuthStateChanged, which fires whenever
 * someone logs in, logs out, or when the app first loads and Firebase
 * checks for an existing session. Each time it fires, we also look up
 * the matching Firestore user document (same uid) to get their profile
 * data, since Auth itself has no concept of role/address/phone.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);

        // Look up this user's Firestore profile document by their uid,
        // the same id Firebase Auth assigned -- that's what keeps the
        // two records linked (see Register.tsx, where the document is
        // first created with this same id).
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setProfile(userDocSnap.data() as UserProfile);
        } else {
          // No matching Firestore document -- likely an account created
          // before the app started creating user documents on register.
          // Treat them as having no role rather than crashing.
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }

      // Firebase has now told us, one way or another, whether someone's
      // logged in -- safe for things like ProtectedRoute to make
      // decisions from here on.
      setAuthLoading(false);
    });

    // Cleanup: stop listening for auth changes if this provider ever
    // unmounts, to avoid a memory leak / updates on an unmounted component.
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, setUser, profile, setProfile, authLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
