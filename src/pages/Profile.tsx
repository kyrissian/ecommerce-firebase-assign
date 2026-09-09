import { useState } from "react";
import {
  deleteUser,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import { isValidPhone } from "../utils/validators";
import {
  getAuthErrorMessage,
  isRequiresRecentLoginError,
} from "../utils/firebaseErrors";
import "./Profile.css";

/**
 * User's profile page. Lets a logged-in user view and edit their
 * display name, contact info (address/phone), change their password,
 * view their order history, and delete their account entirely.
 *
 * Deleting an account removes both the Firebase Auth login and the
 * matching Firestore user document.
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

  // One shared "in flight" flag for whichever of the three save actions
  // below is currently running. Only one edit section can be open at a
  // time in this UI, so a single flag is enough to disable the active
  // Save button and show progress without needing three near-identical
  // booleans.
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateName = async () => {
    if (!user) return;
    setError("");
    setSuccess("");

    if (!displayName.trim()) {
      setError("Name cannot be blank.");
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile(user, { displayName });
      await updateDoc(doc(db, "users", user.uid), { displayName });
      setSuccess("Name updated successfully.");
      setIsEditingName(false);
    } catch (error: unknown) {
      setError(getAuthErrorMessage(error));
    } finally {
      setIsSaving(false);
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

    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { address, phone });
      setProfile(profile ? { ...profile, address, phone } : null);
      setSuccess("Contact info updated successfully.");
      setIsEditingContact(false);
    } catch (error: unknown) {
      setError(getAuthErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !user.email) return;
    setError("");
    setSuccess("");
    setIsSaving(true);
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
      setError(getAuthErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    const uid = user.uid;
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone.",
    );
    if (!confirmed) return;

    setError("");
    try {
      await deleteUser(user);

      // Best effort cleanup: if this fails, the auth account is already
      // deleted, so we log and continue navigation.
      try {
        await deleteDoc(doc(db, "users", uid));
      } catch (cleanupError) {
        console.error(
          "Failed to delete Firestore profile during cleanup:",
          cleanupError,
        );
      }

      navigate("/register");
    } catch (error: unknown) {
      // Firebase requires a recent login before allowing account
      // deletion -- checked via the error's `.code` (Firebase's stable
      // identifier for this specific failure) rather than string-matching
      // `.message`, which isn't guaranteed to stay the same wording.
      if (isRequiresRecentLoginError(error)) {
        setError(
          "For security, please log out and log back in before deleting your account.",
        );
      } else {
        setError(getAuthErrorMessage(error));
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
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                className="profile-btn profile-btn-link"
                onClick={() => setIsEditingName(false)}
                disabled={isSaving}
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
              onClick={() => {
                setDisplayName(user?.displayName ?? "");
                setIsEditingName(true);
              }}
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
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                className="profile-btn profile-btn-link"
                onClick={() => setIsEditingContact(false)}
                disabled={isSaving}
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
              onClick={() => {
                setAddress(profile?.address ?? "");
                setPhone(profile?.phone ?? "");
                setIsEditingContact(true);
              }}
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
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                className="profile-btn profile-btn-link"
                onClick={() => setIsChangingPassword(false)}
                disabled={isSaving}
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
