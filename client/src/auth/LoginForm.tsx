import { FormEvent, useState } from "react";
import { loginUser, SuccessfulLoginResponse } from "../features/auth/authApi"

type LoginFormProps = {
    onLogin: (session: SuccessfulLoginResponse) => void;
}

export default function LoginForm({onLogin} : LoginFormProps){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>){
        event.preventDefault();
        setError(null);
        setSubmitting(true);



        try{
            const user = await loginUser({username, password});
            onLogin(user);
        }catch(err: unknown){
            if(err instanceof Error){
                setError(err.message);
            }else{
                setError("Something went wrong. Please try again.");
            }
        }finally{
            setSubmitting(false);
        }
    }

    return (
        <section>
            <h2>Login Form</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="login-username">Username</label>
                <input
                id="login-username"
                name="username"
                value={username}
                required
                autoComplete="username"
                type="text"
                onChange={(e) => setUsername(e.currentTarget.value)}
                />
                <label htmlFor="login-password">Password</label>
                <input
                id="login-password"
                name="password"
                value={password}
                type="password"
                required
                autoComplete="current-password"
                onChange={(e) => setPassword(e.currentTarget.value)}
                />
                <button type="submit" disabled={submitting}>
                    {submitting ? "Logging in..." : "Log in"}
                </button>
            </form>
            {error && <p>{error}</p>}
        </section>
    )
}
