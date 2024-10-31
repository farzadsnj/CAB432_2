require('dotenv').config(); // Ensure this is at the top

const { DynamoDBClient, ListTablesCommand, CreateTableCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

// Configure DynamoDB Client using environment variables
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

async function setupDynamoDBTable() {
  const qutUsername = "n10937668@qut.edu.au";
  const tableName = "n10937668-VideosTable";
  const sortKey = "name";

  try {
    const listTablesCommand = new ListTablesCommand({});
    const tables = await dynamoClient.send(listTablesCommand);

    if (!tables.TableNames.includes(tableName)) {
      console.log(`Table "${tableName}" does not exist. Creating it...`);

      const createTableCommand = new CreateTableCommand({
        TableName: tableName,
        AttributeDefinitions: [
          { AttributeName: "qut-username", AttributeType: "S" },
          { AttributeName: sortKey, AttributeType: "S" }
        ],
        KeySchema: [
          { AttributeName: "qut-username", KeyType: "HASH" },
          { AttributeName: sortKey, KeyType: "RANGE" }
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
      });

      await dynamoClient.send(createTableCommand);
      console.log(`Table "${tableName}" created successfully.`);
    } else {
      console.log(`Table "${tableName}" already exists.`);
    }
  } catch (error) {
    console.error(`Error setting up DynamoDB table: ${error.message}`);
    throw error;
  }
}

module.exports = { docClient, setupDynamoDBTable };
