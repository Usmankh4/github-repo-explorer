import { useState } from "react";
import RegisterForm from "./auth/RegisterForm";
import { SuccessfulLoginResponse } from "./features/auth/authApi";
import LoginForm from "./auth/LoginForm";

export default function App() {

  const [session, setSession] = useState<SuccessfulLoginResponse | null>(null);

  function handleLogin(userData: SuccessfulLoginResponse){
    setSession(userData);
  }

  function handleLogout(){
    setSession(null);
  }
  return (
    <main>
      <h1>GitHub Repo Explorer</h1>
      {session === null ? (
        <>
        <LoginForm onLogin={handleLogin}/>
        <RegisterForm/>
        </>
      ) : (
        <section>
          <p>Signed in as {session.username}</p>
          <button type="button" onClick={handleLogout}>Log out</button>
        </section>
      )}
    </main>
  );
}

