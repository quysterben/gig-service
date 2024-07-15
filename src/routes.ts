import { verifyGatewayRequest } from '@quysterben/jobber-shared';
import { Application } from 'express';
import { healthRoutes } from '@gig/routes/health.routes';
import { gigRoutes } from '@gig/routes/gig.routes';

const BASE_PATH = '/api/v1/gig';

const appRoutes = (app: Application): void => {
  app.use('', healthRoutes());

  app.use(BASE_PATH, verifyGatewayRequest, gigRoutes());
};

export { appRoutes };
