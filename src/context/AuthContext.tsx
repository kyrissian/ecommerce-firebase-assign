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

interface UserProfile {
  role: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  profile: UserProfile | null;
  /** True until Firebase has resolved whether someone is logged in or not.
   * Prevents things like ProtectedRoute from redirecting prematurely,
   * before we actually know the real auth state. */
  authLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: (_user: User | null) => {},
  profile: null,
  authLoading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);

        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setProfile(userDocSnap.data() as UserProfile);
        } else {
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
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, profile, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
