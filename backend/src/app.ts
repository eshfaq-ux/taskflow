import express from 'express';
import cors from 'cors';
import tasksRouter from './routes/tasks.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', tasksRouter);

// 404 for unknown routes
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Centralised error handler — must be last
app.use(errorHandler);

export default app;
