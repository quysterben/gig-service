import { gigCreate } from '@gig/controllers/create.controller';
import { gigDelete } from '@gig/controllers/delete.controller';
import { gigUpdate, gigUpdateActive } from '@gig/controllers/update.controller';
import express, { Router } from 'express';

const router: Router = express.Router();

const gigRoutes = (): Router => {
  router.post('/create', gigCreate);
  router.put('/:gigId', gigUpdate);
  router.put('/active/:gigId', gigUpdateActive);
  router.delete('/:gigId/:sellerId', gigDelete);

  return router;
};

export { gigRoutes };
