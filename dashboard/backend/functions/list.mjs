import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE'
  };

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
  };

  try {
    const result = await dynamoDb.send(new ScanCommand(params));

    // Sort by timestamp descending (most recent first)
    const sortedItems = result.Items.sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(sortedItems),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: error.statusCode || 501,
      headers,
      body: JSON.stringify({ error: 'Couldn\'t fetch the uptime data.' }),
    };
  }
};
