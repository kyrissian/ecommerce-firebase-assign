import { useState } from "react";
import {
  deleteUser,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

/** Matches exactly xxx-xxx-xxxx -- three digits, dash, three digits,
 * dash, four digits. */
const PHONE_PATTERN = /^\d{3}-\d{3}-\d{4}$/;

/**
 * User's profile page. Lets a logged-in user view and edit their
 * display name, contact info (address/phone), change their password,
 * view their order history, and delete their account entirely.
 *
 * Note: deleting an account only removes the Firebase Auth login --
 * the matching Firestore "users" document is intentionally kept
 * (Security Rules block deletion of it), a common practice for
 * legal/audit record-keeping even after account closure.
 */
const Profile: React.FC = () => {
  const { user, profile, setProfile } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");

  const [isEditingContact, setIsEditingContact] = useState(false);
  const [address, setAddress] = useState(profile?.address ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  /**
   * Saves the edited display name to both Firebase Auth and the matching
   * Firestore "users" document, so the two stay in sync -- Auth's
   * updateProfile alone doesn't touch Firestore at all.
   */
  const handleUpdateName = async () => {
    if (!user) return;
    setError("");
    setSuccess("");
    try {
      await updateProfile(user, { displayName });
      await updateDoc(doc(db, "users", user.uid), { displayName });
      setSuccess("Name updated successfully.");
      setIsEditingName(false);
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
      );
    }
  };

  /**
   * Validates the phone format, saves address and phone to Firestore,
   * then immediately updates the local `profile` state via setProfile --
   * without this, the change would be correctly saved in Firestore but
   * the UI would keep showing stale data until the next full login.
   */
  const handleUpdateContact = async () => {
    if (!user) return;
    setError("");
    setSuccess("");

    if (phone && !PHONE_PATTERN.test(phone)) {
      setError("Phone number must be in the format xxx-xxx-xxxx.");
      return;
    }

    try {
      await updateDoc(doc(db, "users", user.uid), { address, phone });
      setProfile(profile ? { ...profile, address, phone } : null);
      setSuccess("Contact info updated successfully.");
      setIsEditingContact(false);
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
      );
    }
  };

  /**
   * Changes the user's password. Firebase requires re-authenticating
   * with the current password first, as a security measure, before
   * allowing a password change -- that's what reauthenticateWithCredential
   * handles here.
   */
  const handleChangePassword = async () => {
    if (!user || !user.email) return;
    setError("");
    setSuccess("");
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setSuccess("Password updated successfully.");
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
      );
    }
  };

  /**
   * Permanently deletes the user's Firebase Auth account, after a
   * confirmation prompt. Redirects to /register afterward since the
   * user no longer has an account to be logged into.
   */
  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone.",
    );
    if (!confirmed) return;

    setError("");
    try {
      await deleteUser(user);
      navigate("/register");
    } catch (error: unknown) {
      // Firebase requires a recent login before allowing sensitive
      // actions like account deletion. If the user's session is older,
      // it throws this specific error code rather than a generic one --
      // worth a clearer message than Firebase's raw technical text.
      if (
        error instanceof Error &&
        error.message.includes("auth/requires-recent-login")
      ) {
        setError(
          "For security, please log out and log back in before deleting your account.",
        );
      } else {
        setError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        );
      }
    }
  };

  // Guards the whole page: if nobody's logged in, nothing below this
  // renders at all -- unrelated to the recent-login check above, which
  // only applies to the delete-account action for an already-logged-in
  // user whose session happens to be old.
  if (!user) {
    return <p>You must be logged in to view this page.</p>;
  }

  return (
    <div className="profile-page">
      <h1>Profile</h1>

      {error && <p className="profile-alert error">{error}</p>}
      {success && <p className="profile-alert success">{success}</p>}

      <div className="profile-section">
        <p className="profile-section-label">Name</p>
        {isEditingName ? (
          <>
            <input
              className="profile-input"
              type="text"
              placeholder="Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <div className="profile-row">
              <button
                className="profile-btn profile-btn-primary"
                onClick={handleUpdateName}
              >
                Save
              </button>
              <button
                className="profile-btn profile-btn-link"
                onClick={() => setIsEditingName(false)}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div className="profile-row">
            <span className="profile-value">
              {user.displayName || "Not set"}
            </span>
            <button
              className="profile-btn profile-btn-secondary"
              onClick={() => setIsEditingName(true)}
            >
              Edit
            </button>
          </div>
        )}
      </div>

      <div className="profile-section">
        <p className="profile-section-label">Email</p>
        <span className="profile-value">{user.email}</span>
      </div>

      <div className="profile-section">
        <p className="profile-section-label">Contact Info</p>
        {isEditingContact ? (
          <>
            <input
              className="profile-input"
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <input
              className="profile-input"
              type="tel"
              placeholder="Phone Number (xxx-xxx-xxxx)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <div className="profile-row">
              <button
                className="profile-btn profile-btn-primary"
                onClick={handleUpdateContact}
              >
                Save
              </button>
              <button
                className="profile-btn profile-btn-link"
                onClick={() => setIsEditingContact(false)}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div className="profile-row">
            <div className="profile-contact-details">
              <p className="profile-contact-line">
                <span className="profile-contact-label">Address:</span>{" "}
                {profile?.address || "Not set"}
              </p>
              <p className="profile-contact-line">
                <span className="profile-contact-label">Phone:</span>{" "}
                {profile?.phone || "Not set"}
              </p>
            </div>
            <button
              className="profile-btn profile-btn-secondary"
              onClick={() => setIsEditingContact(true)}
            >
              Edit
            </button>
          </div>
        )}
      </div>

      <div className="profile-section">
        <p className="profile-section-label">Password</p>
        {isChangingPassword ? (
          <>
            <input
              className="profile-input"
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <input
              className="profile-input"
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className="profile-row">
              <button
                className="profile-btn profile-btn-primary"
                onClick={handleChangePassword}
              >
                Save
              </button>
              <button
                className="profile-btn profile-btn-link"
                onClick={() => setIsChangingPassword(false)}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div className="profile-row">
            <span className="profile-value">••••••••</span>
            <button
              className="profile-btn profile-btn-secondary"
              onClick={() => setIsChangingPassword(true)}
            >
              Change Password
            </button>
          </div>
        )}
      </div>

      <div className="profile-section">
        <p className="profile-section-label">Orders</p>
        <div className="profile-row">
          <span className="profile-value">View your past purchases</span>
          <button
            className="profile-btn profile-btn-secondary"
            onClick={() => navigate("/orders")}
          >
            View Order History
          </button>
        </div>
      </div>

      <button
        className="profile-btn profile-btn-danger"
        onClick={handleDeleteAccount}
      >
        Delete Account
      </button>
    </div>
  );
};

export default Profile;
