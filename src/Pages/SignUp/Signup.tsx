import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../api/client";
import ErrorMessage from "../../Components/ErrorMessage";
import { useAuth } from "../../context/useAuth";

const initialValues = {
  name: "",
  username: "",
  email: "",
  dateOfBirth: "",
  gender: "",
  password: "",
  rePassword: "",
};

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateValue(field: keyof typeof initialValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (values.password !== values.rePassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(values);
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main>
      <p className="auth-brand">Social App</p>
      <h1 className="auth-title">Create your account</h1>
      <p className="auth-caption">Join the conversation and share what matters.</p>

      <form className="form-stack" onSubmit={handleSubmit}>
        <label className="field">
          <span>Name</span>
          <input
            autoComplete="name"
            className="input"
            onChange={(event) => updateValue("name", event.target.value)}
            required
            value={values.name}
          />
        </label>
        <label className="field">
          <span>Username</span>
          <input
            autoComplete="username"
            className="input"
            onChange={(event) => updateValue("username", event.target.value)}
            required
            value={values.username}
          />
        </label>
        <label className="field">
          <span>Email</span>
          <input
            autoComplete="email"
            className="input"
            onChange={(event) => updateValue("email", event.target.value)}
            required
            type="email"
            value={values.email}
          />
        </label>
        <div className="profile-fields" style={{ marginTop: 0 }}>
          <label className="field">
            <span>Date of birth</span>
            <input
              className="input"
              onChange={(event) => updateValue("dateOfBirth", event.target.value)}
              required
              type="date"
              value={values.dateOfBirth}
            />
          </label>
          <label className="field">
            <span>Gender</span>
            <select
              className="select"
              onChange={(event) => updateValue("gender", event.target.value)}
              required
              value={values.gender}
            >
              <option disabled value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
        </div>
        <label className="field">
          <span>Password</span>
          <input
            autoComplete="new-password"
            className="input"
            onChange={(event) => updateValue("password", event.target.value)}
            required
            type="password"
            value={values.password}
          />
        </label>
        <label className="field">
          <span>Repeat password</span>
          <input
            autoComplete="new-password"
            className="input"
            onChange={(event) => updateValue("rePassword", event.target.value)}
            required
            type="password"
            value={values.rePassword}
          />
        </label>
        {error && <ErrorMessage message={error} />}
        <button className="button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="auth-footer">
        Already have an account? <Link to="/signin">Sign in</Link>
      </p>
    </main>
  );
}
