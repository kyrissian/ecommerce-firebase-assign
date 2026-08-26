import { useState } from "react";
import {
  deleteUser,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleUpdateName = async () => {
    if (!user) return;
    setError("");
    setSuccess("");
    try {
      await updateProfile(user, { displayName });
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
      setError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
      );
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
          <button
            className="profile-btn profile-btn-secondary"
            onClick={() => setIsChangingPassword(true)}
          >
            Change Password
          </button>
        )}
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
