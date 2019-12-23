import { NewsSourcesSchema } from "./config/dynamo-schemas";
import { logger } from "./utils/logger.util";
import { baseDynamoDbClient } from "./clients/dynamodb.client";

async function initDynamoDb() {
  logger.info('Initialising DynamoDB table...');
  await baseDynamoDbClient.createTable(NewsSourcesSchema).promise()
}

async function main() {
  await initDynamoDb();
}

main()
  .then(() => logger.info('Initialization completed.'))
  .catch(e => logger.error(e));