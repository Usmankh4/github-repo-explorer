# GitHub Repo Explorer

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
