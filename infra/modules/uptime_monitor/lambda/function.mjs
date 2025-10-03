import https from "https";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { v4 as uuidv4 } from 'uuid';

const dynamoDB = new DynamoDBClient({});
const sns = new SNSClient({});

// Config
const TABLE_NAME = process.env.DYNAMODB_TABLE;
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;
const WEBSITE_URL = process.env.WEBSITE_URL;
const EXPECTED_STATUS_CODE = parseInt(process.env.EXPECTED_STATUS_CODE);
const EXPECTED_KEYWORD = process.env.EXPECTED_KEYWORD;
const MAX_RESPONSE_TIME_MS = parseInt(process.env.MAX_RESPONSE_TIME_MS)

export async function handler() {
  const start = Date.now();
  let status = "SUCCESS";
  let errorMessage = "";
  let responseTime = 0;

  try {
    const { statusCode, body } = await fetchWebsite(WEBSITE_URL);
    responseTime = Date.now() - start;

    // Check 1: Website availability
    if (statusCode !== EXPECTED_STATUS_CODE) {
      status = "FAILURE";
      errorMessage = `Invalid status: ${statusCode}`;
    }

    // Check 2: Content validation
    if (status === "SUCCESS" && !body.includes(EXPECTED_KEYWORD)) {
      status = "FAILURE";
      errorMessage = `Keyword "${EXPECTED_KEYWORD}" not found in response`;
    }

    // Check 3: Response time validation
    if (status === "SUCCESS" && responseTime > MAX_RESPONSE_TIME_MS) {
      status = "FAILURE";
      errorMessage = `Response time too high: ${responseTime}ms (max allowed: ${MAX_RESPONSE_TIME_MS}ms)`;
    }

  } catch (err) {
    status = "FAILURE";
    errorMessage = `Error: ${err.message}`;
    responseTime = Date.now() - start;
  }

  // Store in DynamoDB
  const timestamp = new Date().toISOString();
  await dynamoDB.send(new PutItemCommand({
    TableName: TABLE_NAME,
    Item: {
      id: { S: uuidv4() },
      timestamp: { S: timestamp },
      status: { S: status },
      responseTime: { N: responseTime.toString() },
      errorMessage: { S: errorMessage },
    },
  }));

  // Send alert if failure
  if (status === "FAILURE") {
    await sns.send(new PublishCommand({
      TopicArn: SNS_TOPIC_ARN,
      Subject: `Website Issue: ${WEBSITE_URL}`,
      Message: `Website: ${WEBSITE_URL}\nStatus: ${status}\nError: ${errorMessage}\nChecked at: ${timestamp}\nResponse time: ${responseTime}ms`,
    }));
  }

  return { status, responseTime, errorMessage };
};

// Helper: fetch website
function fetchWebsite(url) {
  return new Promise((resolve, reject) => {
    let data = "";
    https.get(url, (res) => {
      res.on("data", chunk => (data += chunk));
      res.on("end", () => resolve({ statusCode: res.statusCode, body: data }));
    }).on("error", reject);
  });
}
