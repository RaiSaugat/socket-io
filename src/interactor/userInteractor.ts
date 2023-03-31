import prisma from '../db';
import { createJWT, hashPassword } from '../modules/auth';

export const createUserInteractor = async ({
  username,
  email,
  type,
  password,
}) => {
  try {
    const isUserExist = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (isUserExist) {
      throw new Error('Email not found');
    } else {
      const user = await prisma.user.create({
        data: {
          email,
          username,
          type,
          password: await hashPassword(password),
        },
      });

      const token = createJWT(user);

      return { ...user, token };
    }
  } catch (error) {
    throw new Error(error);
  }
};
