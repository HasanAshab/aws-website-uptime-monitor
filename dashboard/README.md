# Uptime Monitor Dashboard

A real-time dashboard for monitoring website uptime and performance metrics.

## Features

### 📊 Monthly Metrics
- **Uptime Percentage**: Shows the percentage of successful checks this month
- **Invalid Status Count**: Number of times the website returned an unexpected status code
- **Average Response Time**: Mean response time in milliseconds for all checks this month

### 📈 Real-time Monitoring
- **Response Time Chart**: Visual representation of response times over the last 30 minutes
- **Recent Ping Results**: Detailed list of the most recent ping attempts with status and timing

### 🔄 Auto-refresh
- Dashboard automatically refreshes every minute
- Manual refresh button available for immediate updates

## Data Structure

The dashboard expects DynamoDB records with the following structure:
```json
{
  "id": "uuid-string",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "status": "SUCCESS" | "FAILURE",
  "responseTime": "123",
  "errorMessage": "Error description (if any)"
}
```

## API Endpoints

The dashboard uses three main API endpoints:

### GET /metrics
Returns monthly aggregated metrics:
```json
{
  "uptime": 99.5,
  "invalidStatusCount": 2,
  "avgResponseTime": 245,
  "totalChecks": 1440,
  "successfulChecks": 1438,
  "failedChecks": 2,
  "lastUpdated": "2024-01-01T12:00:00.000Z"
}
```

### GET /recent-pings
Returns ping results from the last 30 minutes:
```json
[
  {
    "id": "uuid",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "status": "SUCCESS",
    "responseTime": 123,
    "errorMessage": ""
  }
]
```

### GET /uptime-data
Returns all uptime monitoring data (used by the list function).

## Setup

### Backend
1. Deploy the Lambda functions in the `backend/functions/` directory
2. Set the `DYNAMODB_TABLE` environment variable to your uptime monitoring table
3. Configure API Gateway to route:
   - `/metrics` → `get.mjs`
   - `/recent-pings` → `create.mjs`
   - `/uptime-data` → `list.mjs`

### Frontend
1. Install dependencies:
   ```bash
   cd dashboard/frontend
   npm install
   ```

2. Set your API URL in `.env`:
   ```
   REACT_APP_API_URL=https://your-api-gateway-url.execute-api.region.amazonaws.com
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Technologies Used

- **Frontend**: React, Framer Motion, Recharts, React Icons
- **Backend**: AWS Lambda, DynamoDB
- **Styling**: Custom CSS with modern gradients and animations

## Responsive Design

The dashboard is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## Auto-refresh

The dashboard automatically refreshes data every 60 seconds to provide real-time monitoring capabilities.
