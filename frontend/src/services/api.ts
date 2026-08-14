import type { Board, CreateTaskData, UpdateTaskData, Priority, Task } from '../types/task';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

class ApiError extends Error {
  status?: number;
  
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new ApiError(errorData.error || 'Request failed', response.status);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Unable to connect to server. Please try again.');
  }
}

export async function getBoard(boardId: number): Promise<Board> {
  return fetchApi<Board>(`/boards/${boardId}`);
}

export async function createTask(data: CreateTaskData) {
  return fetchApi('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTask(taskId: number, data: UpdateTaskData) {
  return fetchApi(`/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function moveTask(taskId: number, columnId: number) {
  return fetchApi(`/tasks/${taskId}/move`, {
    method: 'PATCH',
    body: JSON.stringify({ columnId }),
  });
}

export async function deleteTask(taskId: number): Promise<void> {
  return fetchApi(`/tasks/${taskId}`, {
    method: 'DELETE',
  });
}

export async function getTasksByPriority(boardId: number, priority: Priority): Promise<Task[]> {
  return fetchApi<Task[]>(`/boards/${boardId}/tasks?priority=${priority}`);
}

export async function searchTasks(boardId: number, search: string): Promise<Task[]> {
  return fetchApi<Task[]>(`/boards/${boardId}/tasks?search=${encodeURIComponent(search)}`);
}
