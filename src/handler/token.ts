import { NextFunction, Request, Response } from 'express';

import prisma from '../db';
import { hashPassword } from '../modules/auth';
import { generateRandomText } from '../utils';
import { IGetUserAuthInfoRequest } from '../types';

export const generateToken = async (
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await prisma.token.create({
      data: {
        token: await hashPassword(generateRandomText()),
        user: {
          connect: {
            id: req.user.id,
          },
        },
      },
    });

    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const updateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await prisma.token.update({
      where: {
        id: req.params.id,
      },
      data: {
        token: await hashPassword(generateRandomText()),
      },
    });

    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const isUserExist = await prisma.user.findFirst({
      where: {
        email: req.body.email,
      },
    });

    if (isUserExist) {
      const token = await prisma.token.findFirst();
      res.status(200).json(token);
    }
  } catch (error) {
    next(error);
  }
};
