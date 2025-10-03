import axios from 'axios';

// Update this URL to match your deployed API Gateway endpoint
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-api-gateway-url.execute-api.us-west-2.amazonaws.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uptimeAPI = {
  // Get uptime metrics for the current month
  getMetrics: () => api.get('/metrics'),

  // Get recent ping results (last 30 minutes)
  getRecentPings: () => api.get('/recent-pings'),

  // Get all uptime data (for detailed analysis)
  getAllData: () => api.get('/uptime-data'),
};

export default api;
