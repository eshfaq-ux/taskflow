import express from 'express';
import cors from 'cors';
import tasksRouter from './routes/tasks.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Allow frontend from any origin in development, restrict in production
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? allowedOrigins 
    : true,
  credentials: true,
}));

app.use(express.json());

app.use('/api', tasksRouter);

// 404 for unknown routes
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Centralised error handler — must be last
app.use(errorHandler);

export default app;
