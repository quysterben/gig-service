import { health } from '@gig/controllers/health.controller';
import express, { Router } from 'express';

const router: Router = express.Router();

const healthRoutes = (): Router => {
  router.get('/gig-health', health);

  return router;
};

export { healthRoutes };