import { useState, type FormEvent } from "react";
import { changePassword } from "../../api/usersApi";
import { getErrorMessage } from "../../api/client";
import ErrorMessage from "../../Components/ErrorMessage";
import { extractJwtToken } from "../../context/authUtils";
import { useAuth } from "../../context/useAuth";

export default function ChangePassword() {
  const { updateToken } = useAuth();
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (newPassword !== confirmation) {
      setError("New password and confirmation do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await changePassword(password, newPassword);
      updateToken(extractJwtToken(response.data));
      setPassword("");
      setNewPassword("");
      setConfirmation("");
      setSuccess("Your password was updated successfully.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-container">
      <header style={{ marginBottom: 22 }}>
        <h1 className="page-heading">Change password</h1>
        <p className="page-subtitle">Choose a new password for your account.</p>
      </header>

      <section className="panel" style={{ padding: 22 }}>
        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>Current password</span>
            <input
              autoComplete="current-password"
              className="input"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          <label className="field">
            <span>New password</span>
            <input
              autoComplete="new-password"
              className="input"
              onChange={(event) => setNewPassword(event.target.value)}
              required
              type="password"
              value={newPassword}
            />
          </label>
          <label className="field">
            <span>Confirm new password</span>
            <input
              autoComplete="new-password"
              className="input"
              onChange={(event) => setConfirmation(event.target.value)}
              required
              type="password"
              value={confirmation}
            />
          </label>
          {error && <ErrorMessage message={error} />}
          {success && <div className="success-message" role="status">{success}</div>}
          <button className="button" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Updating password..." : "Update password"}
          </button>
        </form>
      </section>
    </main>
  );
}
