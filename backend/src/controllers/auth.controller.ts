import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { hash, compare } from '../utils/password';
import { sign } from '../utils/jwt';
import { success, error } from '../utils/response';
import { SignupInput, LoginInput } from '../schemas/auth.schema';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../services/email.service';

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body as SignupInput;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json(error('Signup failed', 'Email already exists'));
      return;
    }

    // Hash password
    const hashedPassword = await hash(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'MEMBER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = sign({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json(success('User created successfully', { user, token }));
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as LoginInput;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json(error('Login failed', 'Invalid credentials'));
      return;
    }

    // Compare password
    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json(error('Login failed', 'Invalid credentials'));
      return;
    }

    // Generate JWT token
    const token = sign({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user data (excluding password)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    res.status(200).json(success('Login successful', { user: userData, token }));
  } catch (err) {
    next(err);
  }
};

/**
 * Forgot Password - Generate reset token and send email
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      res.status(200).json(success('If the email exists, a reset link has been sent', {}));
      return;
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Generate reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send email with reset link
    console.log('📧 Sending password reset email to:', email);
    const emailResult = await sendPasswordResetEmail(email, resetUrl);

    if (!emailResult.success) {
      console.error('Failed to send email:', emailResult.error);
      // Still return success to prevent email enumeration
    } else {
      console.log('✅ Password reset email sent successfully');
    }

    // Always return same message (security)
    res.status(200).json(success('If the email exists, a reset link has been sent', {
      // Only include in development (for testing without SMTP)
      ...(process.env.NODE_ENV === 'development' && !process.env.BREVO_SMTP_PASS && { resetUrl }),
    }));
  } catch (err) {
    next(err);
  }
};

/**
 * Reset Password - Verify token and update password
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, password } = req.body;

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Token not expired
        },
      },
    });

    if (!user) {
      res.status(400).json(error('Password reset failed', 'Invalid or expired reset token'));
      return;
    }

    // Hash new password
    const hashedPassword = await hash(password);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.status(200).json(success('Password reset successful', {}));
  } catch (err) {
    next(err);
  }
};
