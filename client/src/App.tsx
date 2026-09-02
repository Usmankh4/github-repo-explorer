
import './App.css'
import { useState } from 'react'
import type { FormEvent } from 'react'

type LoginResponse = {
  id: number
  username: string
  token: string
}

function App() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("");
  const [loginResponse, setLoginResponse] = useState<LoginResponse | null>(null);

  

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("");

    try{
      const response = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          username,
          password
        })
      })
      if(!response.ok){
        throw new Error("Login failed")
      }
      const data: LoginResponse = await response.json();
      setLoginResponse(data);

    }catch(error){

      if(error instanceof Error){
      setError(error.message);
      
    }
  }
    


    
  }

  return (
    <>
      <section>
        {loginResponse ? `Logged in as ${loginResponse.username}`: "Please Login In"}
        {error}
        <form onSubmit={login}>
          <input type='text'
        value={username}
        onChange={(event => setUsername(event.target.value))}
        />
         <input 
          type='password'
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          />
        <button type='submit'>Login</button>
        </form>
       
        
      </section>
    </>
  )
}

export default App