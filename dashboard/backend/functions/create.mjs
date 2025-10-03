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
    const items = result.Items || [];

    // Filter for last 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const recentPings = items
      .filter(item => new Date(item.timestamp) >= thirtyMinutesAgo)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map(item => ({
        id: item.id,
        timestamp: item.timestamp,
        status: item.status,
        responseTime: parseInt(item.responseTime) || 0,
        errorMessage: item.errorMessage || ''
      }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(recentPings),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: error.statusCode || 501,
      headers,
      body: JSON.stringify({ error: 'Couldn\'t fetch recent pings.' }),
    };
  }
};
