import "dotenv/config";
import cors from "cors";
import express from "express";

const app = express();
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

app.use(cors({ origin: clientOrigin }));
app.use(express.json());

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

export { app };

