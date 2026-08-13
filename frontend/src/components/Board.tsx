import { useState, useEffect } from 'react';
import type { Board as BoardType, Task, Priority, CreateTaskData, UpdateTaskData } from '../types/task';
import * as api from '../services/api';
import Column from './Column';
import TaskModal from './TaskModal';
import TaskForm from './TaskForm';
import PriorityFilter from './PriorityFilter';
import ErrorMessage from './ErrorMessage';
import Loading from './Loading';

export default function Board() {
  const [board, setBoard] = useState<BoardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');

  const loadBoard = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getBoard(1);
      setBoard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load board');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoard();
  }, []);

  const handleCreateTask = async (data: CreateTaskData) => {
    try {
      setError('');
      await api.createTask(data);
      await loadBoard();
      setShowCreateForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId: number, data: UpdateTaskData) => {
    try {
      setError('');
      await api.updateTask(taskId, data);
      await loadBoard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleMoveTask = async (taskId: number, columnId: number) => {
    try {
      setError('');
      await api.moveTask(taskId, columnId);
      await loadBoard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move task');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      setError('');
      await api.deleteTask(taskId);
      await loadBoard();
      setSelectedTaskId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const getFilteredBoard = (): BoardType | null => {
    if (!board || priorityFilter === 'All') return board;

    return {
      ...board,
      columns: board.columns.map((col) => ({
        ...col,
        tasks: col.tasks.filter((task) => task.priority === priorityFilter),
      })),
    };
  };

  const selectedTask = board?.columns
    .flatMap((col) => col.tasks)
    .find((task) => task.id === selectedTaskId);

  if (loading) return <Loading />;

  const filteredBoard = getFilteredBoard();

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem' }}>{board?.name}</h1>
        <p style={{ color: '#666', margin: 0 }}>Manage your team's tasks</p>
      </div>

      {error && (
        <div style={{ marginBottom: '1rem' }}>
          <ErrorMessage message={error} onRetry={() => setError('')} />
        </div>
      )}

      <PriorityFilter value={priorityFilter} onChange={setPriorityFilter} />

      <button
        onClick={() => setShowCreateForm(!showCreateForm)}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '1rem',
          cursor: 'pointer',
          marginBottom: '1.5rem',
        }}
      >
        {showCreateForm ? 'Cancel' : '+ New Task'}
      </button>

      {showCreateForm && board && (
        <div style={{ marginBottom: '1.5rem' }}>
          <TaskForm
            columns={board.columns.map((col) => ({ id: col.id, name: col.name }))}
            onSubmit={handleCreateTask}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: '1rem',
        overflowX: 'auto',
        paddingBottom: '1rem'
      }}>
        {filteredBoard?.columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            onTaskClick={setSelectedTaskId}
          />
        ))}
      </div>

      {selectedTask && board && (
        <TaskModal
          task={selectedTask}
          columns={board.columns.map((col) => ({ id: col.id, name: col.name }))}
          onUpdate={handleUpdateTask}
          onMove={handleMoveTask}
          onDelete={handleDeleteTask}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}
