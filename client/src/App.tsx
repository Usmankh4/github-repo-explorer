import './App.css'
import { useState } from 'react'
import type { FormEvent } from 'react'

type LoginResponse = {
  id: number
  username: string
  token: string
}
type Favorite = {
  id: number
  repoId: number
  name: string
  url: string
  userId: number
}

type GitHubRepo = {
  id: number
  name: string
  description: string | null
  stargazers_count: number
  html_url: string
  language: string | null
}
function App() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("");
  const [loginResponse, setLoginResponse] = useState<LoginResponse | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [githubUsername, setGithubUsername] = useState("");
  const [repositories, setRepositories] = useState<GitHubRepo[]>([]);

  async function searchGitHub(event: FormEvent<HTMLFormElement>){
    event.preventDefault()
    setError("");
    try{

      const trimmedUsername = githubUsername.trim();
      if(!trimmedUsername){
        setError("Enter a Github username")
        return;
      }
      const response = await fetch(`https://api.github.com/users/${encodeURIComponent(trimmedUsername)}/repos`);
      if(!response.ok){
        throw new Error('Failed to retrieve Github info')
      }
      const data: GitHubRepo[] = await response.json()
      setRepositories(data);
    }catch(error){
      if(error instanceof Error){
        setError(error.message)
      }

    }
  }

  async function saveFavorite(repository: GitHubRepo) {
    setError("")
  
    try {
      if (!loginResponse) {
        setError("Please login first")
        return
      }
  
      const response = await fetch(
        "http://localhost:4000/user/favorites",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${loginResponse.token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            repoId: repository.id,
            name: repository.name,
            url: repository.html_url
          })
        }
      )
      if (!response.ok) {
        throw new Error("Failed to save favorite")
      }
      const data: Favorite = await response.json()
      setFavorites((currentFavorites) => [...currentFavorites, data])
    }catch(error){
      if(error instanceof Error){
        setError(error.message)
      }
    }
  }

  async function getFavorites() {
    setError("");
    try {
      if (!loginResponse) {
        setError("Please login first")
        return
      }
  
      const response = await fetch(
        "http://localhost:4000/user/favorites",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${loginResponse.token}`
          }
        }
      )
      if(!response.ok){
        throw new Error("Failed to get favorites")
      }
      const data: Favorite[] = await response.json();
      setFavorites(data);
  
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      }
    }
  }

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

  if (!loginResponse) {
    return (
      <div className="login-page">
        <header>
          <h1>Repo explorer</h1>
        </header>
        <form onSubmit={login}>
          <h2>Log in</h2>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button type="submit">Log in</button>
          {error ? <p className="form-error">{error}</p> : null}
        </form>
      </div>
    )
  }

  return (
    <section className="app">
      <p>Logged in as {loginResponse.username}</p>
      {error ? <p className="form-error">{error}</p> : null}
      <form
        onSubmit={searchGitHub}
      >
        <input
          type="text"
          value={githubUsername}
          onChange={(event) => setGithubUsername(event.target.value)}
        />
        <button type="submit">Search Github</button>
      </form>

      {repositories.map((repository)=>(
        <article key={repository.id}> 
        <a href={repository.html_url} target="_blank" rel="noreferrer"> View Repository </a>
        <h3>{repository.name} </h3>
        <p>{repository.description ?? "No description"}</p> <p>Langauge: {repository.language ?? "Not specified"}</p> 
        <p> Stars:{repository.stargazers_count} </p>
        <button type='button' onClick={() => saveFavorite(repository)}> Save Favorites</button>
        </article>
      ))}
      <button type="button" onClick={getFavorites}>Get Favorites</button>
      {favorites.map((favorite) => (
        <p key={favorite.id}>{favorite.name}</p>
      ))}
    </section>
  )
}

export default App
