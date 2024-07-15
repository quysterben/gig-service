import { addDataToIndex, deleteIndexedData, getIndexedData, updateIndexedData } from '@gig/elasticsearch';
import { IRatingTypes, IReviewMessageDetails, ISellerGig } from '@quysterben/jobber-shared';
import { gigsSearchBySellerId } from '@gig/services/search.service';
import { GigModel } from '@gig/models/gig.schema';
import { publishDirectMessage } from '@gig/queues/gig.producer';
import { gigChannel } from '@gig/server';

const getGigById = async (gigId: string): Promise<ISellerGig> => {
  const gig: ISellerGig = await getIndexedData('gigs', gigId);
  return gig;
};

const getSellerGigs = async (sellerId: string): Promise<ISellerGig[]> => {
  const resultsHits: ISellerGig[] = [];
  const gigs = await gigsSearchBySellerId(sellerId, true);
  for (const item of gigs.hits) {
    resultsHits.push(item._source as ISellerGig);
  }
  return resultsHits;
};

const getSellerPausedGigs = async (sellerId: string): Promise<ISellerGig[]> => {
  const resultsHits: ISellerGig[] = [];
  const gigs = await gigsSearchBySellerId(sellerId, false);
  for (const item of gigs.hits) {
    resultsHits.push(item._source as ISellerGig);
  }
  return resultsHits;
};

const createGig = async (gig: ISellerGig): Promise<ISellerGig> => {
  const createGig: ISellerGig = await GigModel.create(gig);
  if (createGig) {
    const data: ISellerGig = createGig.toJSON?.() as ISellerGig;
    await publishDirectMessage(
      gigChannel,
      'seller-update',
      'user-seller',
      JSON.stringify({
        type: 'update-gig-count',
        gigSellerId: `${data.sellerId}`,
        count: 1
      }),
      'Details sent to users service'
    );
    await addDataToIndex('gigs', `${createGig._id}`, data);
  }
  return createGig;
};

const updateGig = async (gigId: string, gigData: ISellerGig): Promise<ISellerGig> => {
  const document: ISellerGig = (await GigModel.findOneAndUpdate(
    { _id: gigId },
    {
      $set: {
        title: gigData.title,
        description: gigData.description,
        categories: gigData.categories,
        subCategories: gigData.subCategories,
        tags: gigData.tags,
        price: gigData.price,
        coverImage: gigData.coverImage,
        expectedDelivery: gigData.expectedDelivery,
        basicTitle: gigData.basicTitle,
        basicDescription: gigData.basicDescription
      }
    },
    {
      new: true
    }
  ).exec()) as ISellerGig;
  if (document) {
    const data: ISellerGig = document.toJSON?.() as ISellerGig;
    await updateIndexedData('gigs', `${document._id}`, data);
  }
  return document;
};

const updateActiveGigProp = async (gigId: string, gigActive: boolean): Promise<ISellerGig> => {
  const document: ISellerGig = (await GigModel.findOneAndUpdate(
    { _id: gigId },
    {
      $set: {
        active: gigActive
      }
    },
    {
      new: true
    }
  ).exec()) as ISellerGig;
  if (document) {
    const data: ISellerGig = document.toJSON?.() as ISellerGig;
    await updateIndexedData('gigs', `${document._id}`, data);
  }
  return document;
};

const updateGigReview = async (data: IReviewMessageDetails): Promise<void> => {
  const ratingTypes: IRatingTypes = {
    '1': 'one',
    '2': 'two',
    '3': 'three',
    '4': 'four',
    '5': 'five'
  };
  const ratingKey: string = ratingTypes[`${data.rating}`];
  const gig: ISellerGig = (await GigModel.findOneAndUpdate(
    { _id: data.gigId },
    {
      $inc: {
        ratingsCount: 1,
        ratingSum: data.rating,
        [`ratingCategories.${ratingKey}.value`]: data.rating,
        [`ratingCategories.${ratingKey}.count`]: 1
      }
    },
    { new: true, upsert: true }
  ).exec()) as ISellerGig;
  if (gig) {
    const gigData: ISellerGig = gig.toJSON?.() as ISellerGig;
    await updateIndexedData('gigs', `${gig._id}`, gigData);
  }
};

const deleteGig = async (gigId: string, sellerId: string): Promise<void> => {
  await GigModel.deleteOne({ _id: gigId }).exec();
  await publishDirectMessage(
    gigChannel,
    'seller-update',
    'user-seller',
    JSON.stringify({ type: 'update-gig-count', gigSellerId: sellerId, count: -1 }),
    'Details sent to users service'
  );
  await deleteIndexedData('gigs', gigId);
};

export { getGigById, getSellerGigs, getSellerPausedGigs, createGig, deleteGig, updateGig, updateActiveGigProp, updateGigReview };
