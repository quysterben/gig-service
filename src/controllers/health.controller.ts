import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const health = (_req: Request, res: Response): void => {
  res.status(StatusCodes.OK).send('Gig service is up and running');
};

export { health };