import jwt from "jsonwebtoken";
import type { RequestHandler, Response } from "express";

import { env } from "../config/env.js";

type AuthTokenPayload = {
  userId: number;
};

function sendUnauthorizedResponse(response: Response) {
  response.setHeader("WWW-Authenticate", "Bearer");

  return response.status(401).json({ message: "Authentication required" });
}

function isAuthenticatePayload(payload: unknown): payload is AuthTokenPayload {
  return (
    typeof payload === "object" &&
    payload !== null &&
    !Array.isArray(payload) &&
    "userId" in payload &&
    typeof payload.userId === "number" &&
    Number.isInteger(payload.userId) &&
    payload.userId > 0
  );
}

const authenticateToken: RequestHandler = (request, response, next) => {
  const authorizationHeader = request.headers.authorization;

  if (authorizationHeader === undefined) {
    return sendUnauthorizedResponse(response);
  }

  const [scheme, token, ...extraParts] = authorizationHeader
    .trim()
    .split(/\s+/);

  if (
    scheme?.toLowerCase() !== "bearer" ||
    token === undefined ||
    extraParts.length > 0
  ) {
    return sendUnauthorizedResponse(response);
  }

  try {
    const payload: unknown = jwt.verify(token, env.jwtSecret, {
      algorithms: ["HS256"],
    });

    if (!isAuthenticatePayload(payload)) {
      return sendUnauthorizedResponse(response);
    }

    request.userId = payload.userId;

    return next();
  } catch {
    return sendUnauthorizedResponse(response);
  }
};

export { authenticateToken };