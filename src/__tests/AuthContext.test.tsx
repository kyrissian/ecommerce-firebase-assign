import { useContext } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider } from "../context/AuthContext";
import AuthContext from "../context/authContextInstance";

const mockOnAuthStateChanged = jest.fn();
const mockDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockToastError = jest.fn();

jest.mock("firebase/auth", () => ({
  ...jest.requireActual("firebase/auth"),
  onAuthStateChanged: (...args: unknown[]) => mockOnAuthStateChanged(...args),
}));

jest.mock("firebase/firestore", () => ({
  ...jest.requireActual("firebase/firestore"),
  doc: (...args: unknown[]) => mockDoc(...args),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
}));

jest.mock("react-toastify", () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

const AuthProbe = () => {
  const { user, profile, authLoading } = useContext(AuthContext);

  return (
    <div>
      <span data-testid="auth-loading">
        {authLoading ? "loading" : "ready"}
      </span>
      <span data-testid="auth-user">{user?.uid ?? "none"}</span>
      <span data-testid="auth-profile">{profile ? "present" : "none"}</span>
    </div>
  );
};

describe("AuthProvider edge cases", () => {
  beforeEach(() => {
    mockOnAuthStateChanged.mockReset();
    mockDoc.mockReset();
    mockGetDoc.mockReset();
    mockToastError.mockReset();
    mockDoc.mockReturnValue({});
  });

  test("resolves authLoading and shows toast when profile fetch fails", async () => {
    mockGetDoc.mockRejectedValue(new Error("Firestore unavailable"));

    mockOnAuthStateChanged.mockImplementation(
      (_auth: unknown, callback: (user: { uid: string } | null) => void) => {
        void callback({ uid: "user-123" });
        return jest.fn();
      },
    );

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("auth-loading")).toHaveTextContent("ready");
    });

    expect(screen.getByTestId("auth-user")).toHaveTextContent("user-123");
    expect(screen.getByTestId("auth-profile")).toHaveTextContent("none");
    expect(mockToastError).toHaveBeenCalledWith(
      "Couldn't load your profile. Some features may be limited.",
    );

    consoleSpy.mockRestore();
  });

  test("unsubscribes from auth listener on unmount", () => {
    const unsubscribe = jest.fn();

    mockOnAuthStateChanged.mockImplementation(() => unsubscribe);

    const { unmount } = render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
