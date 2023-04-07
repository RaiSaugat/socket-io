import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      const issueError = error.issues.map((err: any) => {
        return {
          field: err.path[1],
          message: err.message,
        };
      });
      return res.status(400).json({ success: false, error: issueError });
    }
  };
