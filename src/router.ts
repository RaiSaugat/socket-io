import { Router } from 'express';
import { generateToken, getToken, updateToken } from './handler/token';
import { z } from 'zod';

import { createUser, getUserInfo, signin, updateUser } from './handler/user';
import { protect } from './modules/auth';
import { validate } from './modules/validator';

const router = Router();

const signupSchema = z.object({
  body: z.object({
    username: z
      .string({
        required_error: 'Username is required',
      })
      .nonempty(),
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email({
        message: 'Invalid Email',
      }),
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(8, {
        message: 'Password must be at least 8 characters long',
      }),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email({
        message: 'Invalid Email',
      }),
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(8, {
        message: 'Password must be at least 8 characters long',
      }),
  }),
});

const userSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email({
        message: 'Invalid Email',
      }),
    username: z.string({
      required_error: 'Username is required',
    }),
  }),
});

router.post('/signup', validate(signupSchema), createUser);

router.post('/login', validate(loginSchema), signin);

router.get('/user', protect, getUserInfo);

router.put('/user', validate(userSchema), protect, updateUser);

router.get('/generate-token', protect, generateToken);

router.put('/token/:id', protect, updateToken);

router.get('/token', protect, getToken);

export default router;
