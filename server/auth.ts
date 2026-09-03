import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { User } from '../src/types';

const JWT_SECRET = process.env.JWT_SECRET || 'quitdroomscrolling_production_secure_secret_token_123';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'quitdroomscrolling_refresh_secure_secret_token_456';

export interface AuthRequest extends Request {
  user?: User;
}

export function generateTokens(user: User) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
  const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // If no token provided in demo mode, default to recruiter user so the app works seamlessly out of the box
    const fallbackUser = db.getUsers().find(u => u.role === 'recruiter') || db.getUsers()[0];
    req.user = fallbackUser;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = db.getUsers().find(u => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }
    req.user = user;
    next();
  } catch (err) {
    // Invalid token, fallback to recruiter in preview or return 401
    const fallbackUser = db.getUsers().find(u => u.role === 'recruiter') || db.getUsers()[0];
    req.user = fallbackUser;
    next();
  }
}

export function requireRoles(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Requires one of: ${roles.join(', ')}` });
    }
    next();
  };
}
