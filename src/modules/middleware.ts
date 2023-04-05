import { validationResult } from 'express-validator';
import { NextFunction, Request, Response } from 'express';

export const handleInputErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  const mappedErrors = errors.array().map((error) => {
    return {
      field: error.param,
      message: error.msg.message,
    };
  });

  if (!errors.isEmpty()) {
    res.status(400);
    res.json(mappedErrors);
  } else {
    next();
  }
};
