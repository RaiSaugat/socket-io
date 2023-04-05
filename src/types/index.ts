import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface IGetUserAuthInfoRequest extends Request {
  user: JwtPayload;
}
