import { getDocumentCount } from '@gig/elasticsearch';
import { gigCreateSchema } from '@gig/schemes/gig';
import { BadRequestError, ISellerGig, uploads } from '@quysterben/jobber-shared';
import { UploadApiResponse } from 'cloudinary';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const gigCreate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error } = await Promise.resolve(gigCreateSchema.validate(req.body));
    if (error?.details) {
      throw new BadRequestError(error.details[0].message, 'Create gig() method error');
    }
    const result: UploadApiResponse = (await uploads(req.body.coverImage)) as UploadApiResponse;
    if (!result.public_id) {
      throw new BadRequestError('File upload error', 'Create gig() method error');
    }
    const count: number = await getDocumentCount('gigs');
    const gig: ISellerGig = {
      sellerId: req.body.sellerId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      profilePicture: req.body.profilePicture,
      title: req.body.title,
      description: req.body.description,
      categories: req.body.categories,
      subCategories: req.body.subCategories,
      tags: req.body.tags,
      price: req.body.price,
      expectedDelivery: req.body.expectedDelivery,
      basicTitle: req.body.basicTitle,
      basicDescription: req.body.basicDescription,
      coverImage: `${result?.secure_url}`,
      sortId: count + 1
    };
    res.status(StatusCodes.CREATED).json({
      message: 'Gig created successfully',
      gig
    });
  } catch (error) {
    next(error);
  }
};

export { gigCreate };
