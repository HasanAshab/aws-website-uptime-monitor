import axios from 'axios';

// Update this URL to match your deployed API Gateway endpoint
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-api-gateway-url.execute-api.us-west-2.amazonaws.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const todoAPI = {
  // Get all todos
  getTodos: () => api.get('/todos'),

  // Get a single todo by ID
  getTodo: (id) => api.get(`/todos/${id}`),

  // Create a new todo
  createTodo: (text) => api.post('/todos', { text }),

  // Update a todo
  updateTodo: (id, updates) => api.put(`/todos/${id}`, updates),

  // Delete a todo
  deleteTodo: (id) => api.delete(`/todos/${id}`),
};

export default api;
