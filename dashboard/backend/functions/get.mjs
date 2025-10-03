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

    // Filter for current month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthData = items.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    });

    // Calculate metrics
    const totalChecks = currentMonthData.length;
    const successfulChecks = currentMonthData.filter(item => item.status === 'SUCCESS').length;
    const failedChecks = currentMonthData.filter(item => item.status === 'FAILURE').length;
    const invalidStatusCount = currentMonthData.filter(item =>
      item.errorMessage && item.errorMessage.includes('Invalid status')
    ).length;

    const uptime = totalChecks > 0 ? ((successfulChecks / totalChecks) * 100).toFixed(2) : 0;

    // Calculate average response time
    const responseTimes = currentMonthData
      .filter(item => item.responseTime && !isNaN(item.responseTime))
      .map(item => parseInt(item.responseTime));

    const avgResponseTime = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length)
      : 0;

    const metrics = {
      uptime: parseFloat(uptime),
      invalidStatusCount,
      avgResponseTime,
      totalChecks,
      successfulChecks,
      failedChecks,
      lastUpdated: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(metrics),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: error.statusCode || 501,
      headers,
      body: JSON.stringify({ error: 'Couldn\'t fetch metrics.' }),
    };
  }
};
