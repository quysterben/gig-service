import { Client } from '@elastic/elasticsearch';
import { ClusterHealthResponse, GetResponse } from '@elastic/elasticsearch/lib/api/types';
import { config } from '@gig/config';
import { ISellerGig, winstonLogger } from '@quysterben/jobber-shared';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'GigServiceElasticSearch', 'debug');

const elasticSearchClient = new Client({
  node: `${config.ELASTIC_SEARCH_URL}`
});

const checkConnection = async (): Promise<void> => {
  let isConnected = false;
  while (!isConnected) {
    try {
      const health: ClusterHealthResponse = await elasticSearchClient.cluster.health({});
      log.info(`GigService Elasticsearch health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
      log.error('Error connecting to ElasticSearch');
      log.log('error', 'GigService checkConnection() method:', error);
    }
  }
};

async function checkIfIndexExists(indexName: string): Promise<boolean> {
  const result: boolean = await elasticSearchClient.indices.exists({ index: indexName });
  return result;
}

async function createIndex(indexName: string): Promise<void> {
  try {
    const result: boolean = await checkIfIndexExists(indexName);
    if (result) {
      log.info(`Index ${indexName} already exists`);
    } else {
      await elasticSearchClient.indices.create({ index: indexName });
      await elasticSearchClient.indices.refresh({ index: indexName });
      log.info(`Index ${indexName} created`);
    }
  } catch (error) {
    log.error(`An error occurred while creating index ${indexName}`);
    log.log('error', 'GigService createIndex() method:', error);
  }
}

const getIndexedData = async (index: string, itemId: string): Promise<ISellerGig> => {
  try {
    const result: GetResponse = await elasticSearchClient.get({
      index,
      id: itemId
    });
    return result._source as ISellerGig;
  } catch (error) {
    log.log('error', 'GigService getIndexedData() method:', error);
    return {} as ISellerGig;
  }
};

const addDataToIndex = async (index: string, itemId: string, gigDocument: unknown): Promise<void> => {
  try {
    await elasticSearchClient.index({
      index,
      id: itemId,
      document: gigDocument
    });
  } catch (error) {
    log.log('error', 'GigService addDataToIndex() method:', error);
  }
};

const updateIndexedData = async (index: string, itemId: string, gigDocument: unknown): Promise<void> => {
  try {
    await elasticSearchClient.update({
      index,
      id: itemId,
      doc: gigDocument
    });
  } catch (error) {
    log.log('error', 'GigService updateIndexedData() method:', error);
  }
};

const deleteIndexedData = async (index: string, itemId: string): Promise<void> => {
  try {
    await elasticSearchClient.delete({
      index,
      id: itemId
    });
  } catch (error) {
    log.log('error', 'GigService deleteIndexedData() method:', error);
  }
};

export {
  checkConnection,
  checkIfIndexExists,
  createIndex,
  getIndexedData,
  addDataToIndex,
  updateIndexedData,
  deleteIndexedData,
  elasticSearchClient
};
