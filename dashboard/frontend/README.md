# Todo Frontend

A React frontend for the serverless todo API.

## Setup

1. Install dependencies:
```bash
cd src/frontend
npm install
```

2. Configure API endpoint:
```bash
cp .env.example .env
```
Edit `.env` and update `REACT_APP_API_URL` with your deployed API Gateway URL.

3. Start the development server:
```bash
npm start
```

The app will open at http://localhost:3000

## Features

- ✅ View all todos
- ✅ Add new todos
- ✅ Mark todos as complete/incomplete
- ✅ Edit todo text
- ✅ Delete todos
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states

## API Integration

The app connects to your serverless todo API with the following endpoints:
- `GET /todos` - List all todos
- `POST /todos` - Create a new todo
- `GET /todos/{id}` - Get a specific todo
- `PUT /todos/{id}` - Update a todo
- `DELETE /todos/{id}` - Delete a todo

## Deployment

To build for production:
```bash
npm run build
```

The build folder will contain the optimized production files ready for deployment to any static hosting service (S3, Netlify, Vercel, etc.).
