import { winstonLogger } from '@quysterben/jobber-shared';
import { Logger } from 'winston';
import { config } from '@gig/config';
import mongoose from 'mongoose';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'GigServiceDatabase', 'debug');

const databaseConnection = async (): Promise<void> => {
  try {
    await mongoose.connect(`${config.DATABASE_URL}`);
    log.info('GigService Database Connected');
  } catch (error) {
    log.log('error', 'GigService databaseConnection() Error', error);
  }
};

export { databaseConnection };
