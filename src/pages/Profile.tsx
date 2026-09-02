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
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import { isValidPhone } from "../utils/validators";
import "./Profile.css";

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

  const handleUpdateContact = async () => {
    if (!user) return;
    setError("");
    setSuccess("");

    if (phone && !isValidPhone(phone)) {
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
