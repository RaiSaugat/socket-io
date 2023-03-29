import { validationResult } from 'express-validator';

export const handleInputErrors = (req, res, next) => {
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
