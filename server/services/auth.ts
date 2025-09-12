import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import type { User } from '@shared/schema';

// Use JWT_SECRET if available, fallback to SESSION_SECRET for now
const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET;
if (!JWT_SECRET) {
  throw new Error("Either JWT_SECRET or SESSION_SECRET environment variable is required for security");
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: string; // Role is ignored for security - all public registrations become students
}

export interface AdminCreateUserData {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'staff' | 'student';
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: string;
}

export class AuthService {
  // Hash password
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Compare password
  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT token
  generateToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'erp-system',
      audience: 'erp-users',
    });
  }

  // Verify JWT token
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET, {
        issuer: 'erp-system',
        audience: 'erp-users',
      });
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Register new user (public registration - students only)
  async register(data: RegisterData): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // SECURITY: Force student role for public registration
    // Admin/Staff accounts must be created by administrators only
    const secureRole = 'student';

    // Hash password
    const hashedPassword = await this.hashPassword(data.password);

    // Create user with student role only
    const user = await storage.createUser({
      email: data.email,
      passwordHash: hashedPassword,
      name: data.name,
      role: secureRole,
      isActive: true,
    });

    // Generate token
    const token = this.generateToken(user);

    return {
      user,
      token,
      expiresIn: JWT_EXPIRES_IN,
    };
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Find user by email
    const user = await storage.getUserByEmail(credentials.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated. Please contact administrator.');
    }

    // Verify password
    const isPasswordValid = await this.comparePassword(credentials.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = this.generateToken(user);

    return {
      user,
      token,
      expiresIn: JWT_EXPIRES_IN,
    };
  }

  // Refresh token
  async refreshToken(oldToken: string): Promise<AuthResponse> {
    try {
      const decoded = this.verifyToken(oldToken);
      
      // Get fresh user data
      const user = await storage.getUser(decoded.id);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Generate new token
      const token = this.generateToken(user);

      return {
        user,
        token,
        expiresIn: JWT_EXPIRES_IN,
      };
    } catch (error) {
      throw new Error('Unable to refresh token');
    }
  }

  // Change password
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify old password
    const isOldPasswordValid = await this.comparePassword(oldPassword, user.passwordHash);
    if (!isOldPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await this.hashPassword(newPassword);

    // Update password
    await storage.updateUser(userId, {
      passwordHash: hashedNewPassword,
    });
  }
}

// Authentication middleware
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const authService = new AuthService();
    const decoded = authService.verifyToken(token);
    
    // Add user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      passwordHash: '', // Don't expose password hash
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

// Role-based access control middleware
export function requireRole(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions. Required roles: ' + roles.join(', ') 
      });
    }

    next();
  };
}

// Admin only middleware
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return requireRole(['admin'])(req, res, next);
}

// Staff or Admin middleware
export function requireStaffOrAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return requireRole(['admin', 'staff'])(req, res, next);
}

// Create auth service instance
export const authService = new AuthService();