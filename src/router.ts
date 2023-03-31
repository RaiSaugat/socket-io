import { Router } from 'express';
import { check } from 'express-validator';
import { generateToken, getToken, updateToken } from './handler/token';

import { createUser, getUserInfo, signin, updateUser } from './handler/user';
import { protect } from './modules/auth';
import { handleInputErrors } from './modules/middleware';

const router = Router();

router.post(
  '/signup',
  check('username').notEmpty().withMessage({
    message: 'Username is required',
  }),
  check('email').notEmpty().withMessage({
    message: 'Email is required',
  }),
  check('password').notEmpty().withMessage({
    message: 'Password is required',
  }),
  handleInputErrors,
  createUser
);

router.post(
  '/login',
  check('email').notEmpty().withMessage({
    message: 'Email is required',
  }),
  check('password').notEmpty().withMessage({
    message: 'Password is required',
  }),
  handleInputErrors,
  signin
);
router.get('/user', protect, getUserInfo);
router.put('/user', protect, updateUser);

router.get('/generate-token', protect, generateToken);
router.put('/token/:id', protect, updateToken);
router.get('/token', protect, getToken);

export default router;
