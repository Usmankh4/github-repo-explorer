# GitHub Repo Explorer

A fullstack TypeScript app for exploring GitHub repositories: search any
GitHub user's public repos, and sign in to save your favorites to your
account.

## Features

**Explore**
- Search public repositories by GitHub username
- Each repo shows name, description, star count, language, and a link
- Loading states and error handling (e.g. username not found)

**Favorites (requires login)**
- Save repos to your account with one click
- View and manage your saved favorites
- Remove favorites anytime

## Tech stack

- **Frontend:** React + TypeScript (Vite)
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL
- **Auth:** JWT + bcrypt
- **API:** GitHub REST API

## API endpoints

- `POST /auth/register` — create an account
- `POST /auth/login` — sign in, receive a JWT
- `GET /user/favorites` — list your saved repos (JWT protected)
- `POST /user/favorites` — save a repo (JWT protected)
- `DELETE /user/favorites/:id` — remove a saved repo (JWT protected)

---

## Setup

Use a Vite-supported Node.js release: 20.19+, 22.12+, or a newer maintained
major version.

From the project root, install the frontend dependencies:

```bash
npm --prefix client install
```

Install the backend dependencies:

```bash
npm --prefix server install
```

Copy `client/.env.example` to `client/.env` and `server/.env.example` to
`server/.env` if you want to change the local defaults.

## Run locally

Start the backend in one terminal:

```bash
npm --prefix server run dev
```

Start the frontend in a second terminal:

```bash
npm --prefix client run dev
```

Open `http://localhost:5173` for the frontend. Check the backend at
`http://localhost:4000/health`.
