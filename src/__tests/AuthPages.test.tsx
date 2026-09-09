import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import Login from "../pages/Login";
import Register from "../pages/Register";

const mockNavigate = jest.fn();

const mockSignInWithEmailAndPassword = jest.fn();
const mockCreateUserWithEmailAndPassword = jest.fn();
const mockUpdateProfile = jest.fn();

const mockDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockSetDoc = jest.fn();

jest.mock("../context/useAuth", () => ({
  useAuth: () => ({ user: null }),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("firebase/auth", () => ({
  ...jest.requireActual("firebase/auth"),
  signInWithEmailAndPassword: (...args: unknown[]) =>
    mockSignInWithEmailAndPassword(...args),
  createUserWithEmailAndPassword: (...args: unknown[]) =>
    mockCreateUserWithEmailAndPassword(...args),
  updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
}));

jest.mock("firebase/firestore", () => ({
  ...jest.requireActual("firebase/firestore"),
  doc: (...args: unknown[]) => mockDoc(...args),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
}));

describe("Auth pages edge cases", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockSignInWithEmailAndPassword.mockReset();
    mockCreateUserWithEmailAndPassword.mockReset();
    mockUpdateProfile.mockReset();
    mockDoc.mockReset();
    mockGetDoc.mockReset();
    mockSetDoc.mockReset();

    mockDoc.mockReturnValue({});
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ role: "customer" }),
    });
  });

  test("Login shows a friendly auth error when sign-in fails", async () => {
    mockSignInWithEmailAndPassword.mockRejectedValue(
      new FirebaseError("auth/invalid-credential", "Invalid credential"),
    );

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "bad-password" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(
      await screen.findByText("Incorrect email or password."),
    ).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("Login shows loading text and disables submit while auth is pending", async () => {
    let resolveAuth!: (value: {
      user: { uid: string; displayName: string };
    }) => void;
    const pendingAuth = new Promise<{
      user: { uid: string; displayName: string };
    }>((resolve) => {
      resolveAuth = resolve;
    });

    mockSignInWithEmailAndPassword.mockReturnValue(pendingAuth);

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "good-password" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    const loadingButton = screen.getByRole("button", { name: "Logging in..." });
    expect(loadingButton).toBeDisabled();

    resolveAuth({
      user: { uid: "u1", displayName: "Casey" },
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  test("Register shows partial-setup error when Firestore profile write fails", async () => {
    mockCreateUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: "u1", displayName: "Casey" },
    });
    mockUpdateProfile.mockResolvedValue(undefined);
    mockSetDoc.mockRejectedValue(new Error("firestore write failed"));

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "Casey" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(
      await screen.findByText(/account was created, but we couldn't finish/i),
    ).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
