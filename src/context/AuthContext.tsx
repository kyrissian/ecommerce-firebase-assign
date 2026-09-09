import { useState, useEffect, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
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
    let isActive = true;
    let latestAuthEvent = 0;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const authEventId = ++latestAuthEvent;

      const syncAuthState = async () => {
        if (!isActive) return;

        if (firebaseUser) {
          setUser(firebaseUser);

          // The Firestore profile lookup is wrapped in its own try/catch
          // (rather than letting a failure bubble up) because
          // onAuthStateChanged's callback isn't awaited or caught by
          // Firebase itself -- an unhandled rejection here would silently
          // vanish, leaving `authLoading` stuck at `true` forever (since
          // the line below would never run) and every ProtectedRoute in
          // the app stranded on its "Loading..." state with no way out.
          try {
            const userDocRef = doc(db, "users", firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);

            // Ignore stale async completions from an older auth event.
            if (!isActive || authEventId !== latestAuthEvent) return;

            setProfile(
              userDocSnap.exists() ? (userDocSnap.data() as UserProfile) : null,
            );
          } catch (error) {
            if (!isActive || authEventId !== latestAuthEvent) return;
            console.error("Failed to load user profile:", error);
            setProfile(null);
            toast.error(
              "Couldn't load your profile. Some features may be limited.",
            );
          }
        } else {
          setUser(null);
          setProfile(null);
        }

        // Runs regardless of whether the profile lookup above succeeded,
        // failed, or was skipped (logged-out case) -- authLoading must
        // always resolve so the rest of the app isn't left waiting.
        if (isActive && authEventId === latestAuthEvent) {
          setAuthLoading(false);
        }
      };

      void syncAuthState();
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, setUser, profile, setProfile, authLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
