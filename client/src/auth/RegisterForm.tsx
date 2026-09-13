import { useState, type FormEvent } from "react";
import { registerUser, type SuccessfulRegistrationResponse } from "../features/auth/authApi";

type RegistrationSubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; user: SuccessfulRegistrationResponse }
  | { status: "error"; message: string };

function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [registrationSubmissionState, setRegistrationSubmissionState] =
    useState<RegistrationSubmissionState>({ status: "idle" });

  const isSubmitting = registrationSubmissionState.status === "submitting";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    setRegistrationSubmissionState({ status: "submitting" });

    try {
      const user = await registerUser({ username, password });
      setRegistrationSubmissionState({ status: "success", user });
      setPassword("");
    } catch (err) {
      setRegistrationSubmissionState({
        status: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  }

  return (
    <section>
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input
          value={username}
          required
          autoComplete="username"
          id="username"
          name="username"
          type="text"
          onChange={(event) => setUsername(event.currentTarget.value)}
        />

        <label htmlFor="password">Password</label>
        <input
          required
          value={password}
          minLength={8}
          autoComplete="new-password"
          id="password"
          name="password"
          type="password"
          onChange={(event) => setPassword(event.currentTarget.value)}
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      {registrationSubmissionState.status === "error" && (
        <p role="alert">{registrationSubmissionState.message}</p>
      )}

      {registrationSubmissionState.status === "success" && (
        <p role="status">
          Account created for {registrationSubmissionState.user.username}
        </p>
      )}
    </section>
  );
}

export default RegisterForm;