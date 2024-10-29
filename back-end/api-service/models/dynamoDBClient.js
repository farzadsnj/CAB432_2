const { DynamoDBClient, ListTablesCommand, CreateTableCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

async function setupDynamoDBTable() {
    const qutUsername = "n10937668@qut.edu.au";
    const tableName = "n10937668-VideosTable";
    const sortKey = "name";

    const listTablesCommand = new ListTablesCommand({});
    const tables = await dynamoClient.send(listTablesCommand);

    if (!tables.TableNames.includes(tableName)) {
        console.log(`Table "${tableName}" does not exist. Creating it...`);

        // Create table if it doesn't exist
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
        try {
            await dynamoClient.send(createTableCommand);
            console.log(`Table "${tableName}" created successfully.`);
        } catch (error) {
            console.error(`Error creating table: ${error.message}`);
            throw error;
        }
    } else {
        console.log(`Table "${tableName}" already exists.`);
    }
}

module.exports = { docClient, setupDynamoDBTable };
