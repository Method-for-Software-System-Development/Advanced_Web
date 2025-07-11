/**
 * Authentication Middleware for verifying JWT tokens in protected routes.
 * 
 * - Checks the 'Authorization' header for a valid Bearer token.
 * - If valid, attaches the decoded user data to req.user and calls next().
 * - If invalid or missing, responds with 401 Unauthorized.
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  // Get the token from the Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided. Authorization denied." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token is not valid." });
  }
}
