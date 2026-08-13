import { Router } from 'express';
import * as controller from '../controllers/tasks.controller';

const router = Router();

// Board endpoints
router.get('/boards/:boardId', controller.getBoard);
router.get('/boards/:boardId/tasks', controller.getBoardTasks);
router.get('/boards/:boardId/column-counts', controller.getColumnCounts);

// Task endpoints
router.post('/tasks', controller.createTask);
router.patch('/tasks/:taskId', controller.updateTask);
router.patch('/tasks/:taskId/move', controller.moveTask);
router.delete('/tasks/:taskId', controller.deleteTask);

export default router;
