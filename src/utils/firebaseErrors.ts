import { FirebaseError } from "firebase/app";

/**
 * Maps Firebase Auth's machine-readable error codes (the part after
 * "auth/") to plain-English messages a user should actually see.
 * Only the codes this app's auth flows can realistically hit are
 * listed -- anything else falls through to a generic message in
 * getAuthErrorMessage below, rather than growing this list to try to
 * cover every possible code Firebase might ever return.
 */
const FRIENDLY_AUTH_ERRORS: Record<string, string> = {
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/user-not-found": "No account found with that email.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/email-already-in-use": "An account with that email already exists.",
  "auth/weak-password": "Password should be at least 6 characters.",
  "auth/invalid-email": "That doesn't look like a valid email address.",
  "auth/too-many-requests":
    "Too many attempts. Please wait a moment and try again.",
  "auth/network-request-failed":
    "Network error. Please check your connection and try again.",
  "auth/requires-recent-login":
    "For security, please log out and log back in before doing this.",
};

/**
 * Converts a caught Firebase Auth error into a message that's safe and
 * helpful to show a user, rather than surfacing Firebase's raw
 * "Firebase: Error (auth/invalid-credential)." string.
 *
 * Checks `error.code` (e.g. "auth/wrong-password") rather than
 * pattern-matching on `error.message`, since the code is Firebase's
 * stable, documented identifier for the failure -- the message text
 * is meant for logs/debugging and isn't guaranteed to stay the same
 * across firebase versions.
 */
export const getAuthErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError && FRIENDLY_AUTH_ERRORS[error.code]) {
    return FRIENDLY_AUTH_ERRORS[error.code];
  }
  return "Something went wrong. Please try again.";
};

/**
 * True when a caught error is specifically Firebase's
 * "auth/requires-recent-login" code -- used where the app needs to
 * react differently to that one case (Profile's account deletion
 * flow) rather than just displaying a message for it.
 */
export const isRequiresRecentLoginError = (error: unknown): boolean =>
  error instanceof FirebaseError && error.code === "auth/requires-recent-login";
