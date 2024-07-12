import { addDataToIndex, getIndexedData } from '@gig/elasticsearch';
import { ISellerGig } from '@quysterben/jobber-shared';
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

export { getGigById, getSellerGigs, getSellerPausedGigs, createGig };
