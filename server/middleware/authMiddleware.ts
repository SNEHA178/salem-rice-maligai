import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { dbManager } from '../db';
import { isDbConnected } from '../config/db';
import { getJwtSecret } from '../config/jwt';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    _id?: string;
    email: string;
    phone: string;
    name: string;
    role: 'CUSTOMER' | 'ADMIN';
  };
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(`[AUTH DEBUG]\nUser: None\nUser ID: None\nRole: None\nToken verification: FAILED\nResult: Missing or invalid Bearer header`);
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in.',
      });
    }

    const token = authHeader.split(' ')[1]?.trim();
    if (!token || token === 'undefined' || token === 'null') {
      console.log(`[AUTH DEBUG]\nUser: None\nUser ID: None\nRole: None\nToken verification: FAILED\nResult: Token is empty or undefined string`);
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please login again.',
      });
    }

    const jwtSecret = getJwtSecret();

    // 1. Try decoding with JWT
    try {
      const decoded = jwt.verify(token, jwtSecret) as any;
      if (decoded && (decoded.id || decoded.userId || decoded._id)) {
        const userId = decoded.id || decoded.userId || decoded._id;

        if (isDbConnected()) {
          const userDoc = await User.findById(userId).select('-passwordHash');
          if (userDoc) {
            req.user = {
              id: userDoc._id.toString(),
              _id: userDoc._id.toString(),
              email: userDoc.email,
              phone: userDoc.phone,
              name: userDoc.name,
              role: userDoc.role,
            };
            console.log(`[AUTH DEBUG]\nUser: ${req.user.email}\nUser ID: ${req.user.id}\nRole: ${req.user.role}\nToken verification: SUCCESS\nResult: Authenticated via MongoDB`);
            return next();
          }
        } else {
          const localUser = await dbManager.getUserById(userId);
          if (localUser) {
            const { passwordHash: _, ...safe } = localUser;
            req.user = {
              id: safe._id,
              _id: safe._id,
              email: safe.email,
              phone: safe.phone,
              name: safe.name,
              role: safe.role,
            };
            console.log(`[AUTH DEBUG]\nUser: ${req.user.email}\nUser ID: ${req.user.id}\nRole: ${req.user.role}\nToken verification: SUCCESS\nResult: Authenticated via Local Store`);
            return next();
          }
        }

        // Verified JWT payload fallback (signature verified with JWT_SECRET)
        if (decoded.role) {
          req.user = {
            id: String(userId),
            _id: String(userId),
            email: decoded.email || '',
            phone: decoded.phone || '',
            name: decoded.name || (decoded.role === 'ADMIN' ? 'Store Administrator' : 'Salem Customer'),
            role: decoded.role,
          };
          console.log(`[AUTH DEBUG]\nUser: ${req.user.email}\nUser ID: ${req.user.id}\nRole: ${req.user.role}\nToken verification: SUCCESS\nResult: Authenticated via Verified JWT Payload`);
          return next();
        }
      }
    } catch (jwtErr: any) {
      console.log(`[AUTH DEBUG]\nUser: None\nUser ID: None\nRole: None\nToken verification: FAILED\nResult: JWT verification failed: ${jwtErr.message}`);
    }

    return res.status(401).json({
      success: false,
      message: 'Your session has expired. Please login again.',
    });
  } catch (error: any) {
    console.log(`[AUTH DEBUG]\nUser: None\nUser ID: None\nRole: None\nToken verification: FAILED\nResult: Internal auth failure: ${error.message}`);
    return res.status(401).json({
      success: false,
      message: 'Your session has expired. Please login again.',
    });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in.',
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: "You don't have permission to perform this action.",
    });
  }

  next();
};

export default { requireAuth, requireAdmin };
