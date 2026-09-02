import { useState, useEffect, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import AuthContext, { type UserProfile } from "./authContextInstance";

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

      setAuthLoading(false);
    });

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
