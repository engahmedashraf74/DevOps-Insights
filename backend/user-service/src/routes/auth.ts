import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { jwtService, logger } from '@apnidukaan/shared';
import { UserModel } from '../models/User';

const router: express.Router = express.Router();

const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000;
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  const isProduction = process.env.NODE_ENV === 'production';

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? 'strict' : 'lax') as 'strict' | 'lax',
    path: '/'
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: ACCESS_COOKIE_MAX_AGE
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: REFRESH_COOKIE_MAX_AGE
  });
}

function publicUser(user: any) {
  return {
    id: (user._id as mongoose.Types.ObjectId).toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    emailVerified: user.emailVerified,
    avatar: user.avatar
  };
}

// REGISTER
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').trim().isLength({ min: 2, max: 50 }),
    body('lastName').trim().isLength({ min: 2, max: 50 })
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email, password, firstName, lastName } = req.body;

      const existingUser = await UserModel.findOne({ email });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Email already registered',
          code: 'EMAIL_EXISTS'
        });
      }

      const hashedPassword = await bcrypt.hash(
        password,
        Number(process.env.BCRYPT_ROUNDS) || 12
      );

      const user = await UserModel.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'customer',
        emailVerified: false,
        isEmailVerified: false,
        active: true,
        status: 'active',
        tokenVersion: 0
      });

      const tokens = jwtService.generateTokenPair({
        id: (user._id as mongoose.Types.ObjectId).toString(),
        email: user.email,
        role: user.role,
        isActive: user.active
      });

      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

      logger.info('User registered successfully', {
        userId: (user._id as mongoose.Types.ObjectId).toString()
      });

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: publicUser(user),
          tokens
        }
      });
    } catch (error: any) {
      logger.error('Registration error', {
        error: error.message
      });

      return res.status(500).json({
        success: false,
        error: 'Registration failed',
        code: 'REGISTRATION_ERROR'
      });
    }
  }
);

// LOGIN
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email, password } = req.body;

      const user = await UserModel.findOne({ email }).select('+password');

      if (!user || !user.password) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
      }

      if (!user.active || user.status !== 'active') {
        return res.status(403).json({
          success: false,
          error: 'Account is not active',
          code: 'ACCOUNT_INACTIVE'
        });
      }

      if (user.security.lockUntil && user.security.lockUntil > new Date()) {
        return res.status(423).json({
          success: false,
          error: 'Account temporarily locked',
          code: 'ACCOUNT_LOCKED'
        });
      }

      const passwordValid = await bcrypt.compare(password, user.password);

      if (!passwordValid) {
        user.security.failedLoginAttempts += 1;
        user.security.lastFailedLogin = new Date();

        if (user.security.failedLoginAttempts >= 5) {
          user.security.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
        }

        await user.save();

        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
      }

      user.security.failedLoginAttempts = 0;
      user.security.lastFailedLogin = null;
      user.security.lockUntil = null;
      user.security.lastLogin = new Date();

      await user.save();

      const tokens = jwtService.generateTokenPair({
        id: (user._id as mongoose.Types.ObjectId).toString(),
        email: user.email,
        role: user.role,
        isActive: user.active,
        lastLogin: user.security.lastLogin.toISOString()
      });

      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

      logger.info('User logged in successfully', {
        userId: (user._id as mongoose.Types.ObjectId).toString()
      });

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: publicUser(user),
          tokens
        }
      });
    } catch (error: any) {
      logger.error('Login error', {
        error: error.message
      });

      return res.status(500).json({
        success: false,
        error: 'Login failed',
        code: 'LOGIN_ERROR'
      });
    }
  }
);

// LOGOUT
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });

  return res.json({
    success: true,
    message: 'Logout successful'
  });
});

export default router;
