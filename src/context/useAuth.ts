import { useContext } from "react";
import AuthContext from "./authContextInstance";

/**
 * Custom hook for accessing the auth context (user, profile, authLoading).
 * Split out from AuthContext.tsx to resolve a Fast Refresh warning that
 * comes from mixing component and non-component exports in the same file.
 */
export const useAuth = () => useContext(AuthContext);
