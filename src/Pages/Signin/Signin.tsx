import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../api/client";
import ErrorMessage from "../../Components/ErrorMessage";
import { useAuth } from "../../context/useAuth";

interface RedirectState {
  from?: {
    pathname?: string;
  };
}

export default function Signin() {
  const { signin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = (location.state as RedirectState | null)?.from?.pathname || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signin({ email: email.trim(), password });
      navigate(redirect, { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main>
      <p className="auth-brand">Social App</p>
      <h1 className="auth-title">Welcome back</h1>
      <p className="auth-caption">Sign in to catch up with your community.</p>

      <form className="form-stack" onSubmit={handleSubmit}>
        <label className="field">
          <span>Email or username</span>
          <input
            autoComplete="username"
            className="input"
            onChange={(event) => setEmail(event.target.value)}
            required
            value={email}
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            autoComplete="current-password"
            className="input"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        {error && <ErrorMessage message={error} />}
        <button className="button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="auth-footer">
        New to Social App? <Link to="/signup">Create an account</Link>
      </p>
    </main>
  );
}
