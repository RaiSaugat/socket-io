import prisma from '../db';
import { comparePasswords, createJWT, hashPassword } from '../modules/auth';

export const createUser = async (req, res, next) => {
  try {
    const isUserExist = await prisma.user.findFirst({
      where: {
        email: req.body.email,
      },
    });

    if (isUserExist) {
      res.status(403).json({ message: 'Email already exists' });
    } else {
      const user = await prisma.user.create({
        data: {
          email: req.body.email,
          username: req.body.username,
          type: req.body.type,
          password: await hashPassword(req.body.password),
        },
      });

      const token = createJWT(user);

      res.json({
        id: user.id,
        email: user.email,
        username: user.username,
        type: user.type,
        token,
      });
    }
  } catch (error) {
    console.log(error);
    error.type = 'input';
    next(error);
  }
};

export const signin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (!user) {
      res.status(401).json({ message: 'Email is not in our system' });
      return;
    }

    const isValid = await comparePasswords(req.body.password, user.password);

    if (!isValid) {
      res.status(401).json({ message: 'Credentials does not match' });
      return;
    }

    const token = createJWT(user);

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      token,
      type: user.type,
    });
  } catch (error) {
    error.type = 'input';
    next(error);
  }
};

export const getUserInfo = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
  });

  res.json({
    id: user.id,
    email: user.email,
    username: user.username,
  });
};

export const updateUser = async (req, res, next) => {
  try {
    const data: { email: string; username: string; password?: string } = {
      email: req.body.email,
      username: req.body.username,
    };

    if (req.body.password) {
      data.password = await hashPassword(req.body.password);
    }
    const isUserExist = await prisma.user.findFirst({
      where: {
        email: req.body.email,
      },
    });

    if (isUserExist) {
      res.status(403).json({ message: 'Email already exists' });
    } else {
      const user = await prisma.user.update({
        where: {
          id: req.user.id,
        },
        data,
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        username: user.username,
        email: user.email,
        type: user.type,
        id: user.id,
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};
