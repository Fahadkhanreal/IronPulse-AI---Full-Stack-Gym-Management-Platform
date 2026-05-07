import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { hash, compare } from '../utils/password';
import { sign } from '../utils/jwt';
import { success, error } from '../utils/response';
import { SignupInput, LoginInput } from '../schemas/auth.schema';

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
