import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: 'USER' | 'ADMIN';
  };
}

// ===============================
// AUTHENTICATE USER
// ===============================
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Authentication required.',
      });
    }

    // Get token from "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Authentication token is missing.',
      });
    }

    // Make sure JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    ) as {
      userId: string;
      role: 'USER' | 'ADMIN';
    };

    // Attach user information to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    // Continue to the controller
    next();
  } catch (error) {
    console.error('Authentication error:', error);

    return res.status(401).json({
      message: 'Invalid or expired token.',
    });
  }
};

// ===============================
// REQUIRE ADMIN
// ===============================
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // User must be authenticated first
  if (!req.user) {
    return res.status(401).json({
      message: 'Authentication required.',
    });
  }

  // Check user role
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      message: 'Admin access required.',
    });
  }

  // User is an admin
  next();
};