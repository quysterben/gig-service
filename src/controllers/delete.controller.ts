import { deleteGig } from '@gig/services/gig.service';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

const gigDelete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await deleteGig(req.params.gigId, req.params.sellerId);
    res.status(StatusCodes.OK).json({ message: 'Gig deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export { gigDelete };
