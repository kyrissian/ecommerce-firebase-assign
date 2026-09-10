import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Profile from "../pages/Profile";
import type { AuthContextType } from "../context/authContextInstance";

let mockAuthValue: Partial<AuthContextType>;

jest.mock("../context/useAuth", () => ({
  useAuth: () => mockAuthValue,
}));

const renderProfile = () =>
  render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>,
  );

describe("Profile", () => {
  /**
   * Regression test for a real bug: displayName/address/phone used to be
   * seeded from `user`/`profile` via plain useState initializers, which
   * React only evaluates on a component's very first render. Profile
   * isn't wrapped in ProtectedRoute (any logged-in user can view their
   * own profile, and the page needs to render its own "not logged in"
   * message rather than redirecting), so it can mount before
   * AuthContext has finished resolving -- e.g. on a hard refresh
   * directly on /profile. When that happened, the form fields stayed
   * blank forever even after the real user/profile data arrived a
   * moment later, since useState ignores an initializer argument on
   * every render after the first. They should now sync once that data
   * resolves.
   */
  it("populates the name and contact fields once auth data resolves after an initial render with no user yet", () => {
    // Simulate Profile mounting before AuthContext has resolved.
    mockAuthValue = { user: null, profile: null, setProfile: jest.fn() };
    const { rerender } = renderProfile();

    expect(
      screen.getByText("You must be logged in to view this page."),
    ).toBeInTheDocument();

    // Simulate auth resolving a moment later with real data.
    mockAuthValue = {
      user: {
        uid: "123",
        displayName: "Jamie Rivera",
        email: "jamie@example.com",
      } as AuthContextType["user"],
      profile: {
        role: "customer",
        address: "123 Main St",
        phone: "555-123-4567",
      },
      setProfile: jest.fn(),
    };
    rerender(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getAllByText("Edit")[0]);
    expect(screen.getByPlaceholderText("Name")).toHaveValue("Jamie Rivera");

    // Name's "Edit" button is now "Save"/"Cancel", so Contact's "Edit" is
    // the only one left in the list.
    fireEvent.click(screen.getAllByText("Edit")[0]);
    expect(screen.getByPlaceholderText("Address")).toHaveValue("123 Main St");
    expect(
      screen.getByPlaceholderText("Phone Number (xxx-xxx-xxxx)"),
    ).toHaveValue("555-123-4567");
  });

  /**
   * The sync above must not clobber an in-progress edit: if the user has
   * already opened the name field and started typing, a re-render
   * carrying the same (or newer) auth data shouldn't blow away what
   * they've typed.
   */
  it("does not overwrite an in-progress edit when auth data changes again", () => {
    mockAuthValue = {
      user: {
        uid: "123",
        displayName: "Jamie Rivera",
      } as AuthContextType["user"],
      profile: { role: "customer" },
      setProfile: jest.fn(),
    };
    const { rerender } = renderProfile();

    fireEvent.click(screen.getAllByText("Edit")[0]);
    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "Jamie R. (editing)" },
    });

    // Auth context re-emits (e.g. a token refresh) with the same
    // underlying data while the field is still being edited.
    mockAuthValue = {
      user: {
        uid: "123",
        displayName: "Jamie Rivera",
      } as AuthContextType["user"],
      profile: { role: "customer" },
      setProfile: jest.fn(),
    };
    rerender(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    expect(screen.getByPlaceholderText("Name")).toHaveValue(
      "Jamie R. (editing)",
    );
  });
});
