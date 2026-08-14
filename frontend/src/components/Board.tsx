import { useState, useEffect } from 'react';
import type { Board as BoardType, Priority, CreateTaskData, UpdateTaskData } from '../types/task';
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

  const loadBoard = async (priority?: Priority | 'All') => {
    try {
      setLoading(true);
      setError('');

      // DATABASE-LEVEL filtering when a priority is selected — requirement from assignment
      // This ensures the SQL query with WHERE clause executes in PostgreSQL, not JS filtering
      if (priority && priority !== 'All') {
        const data = await api.getBoard(1);
        const filteredTasks = await api.getTasksByPriority(1, priority);
        
        // Merge filtered tasks back into the board structure by column
        const columnsWithFilteredTasks = data.columns.map((col) => ({
          ...col,
          tasks: filteredTasks.filter((task) => task.column_id === col.id),
        }));
        
        setBoard({ ...data, columns: columnsWithFilteredTasks });
      } else {
        // No filter — load full board
        const data = await api.getBoard(1);
        setBoard(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load board');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoard(priorityFilter);
  }, [priorityFilter]);

  const handleCreateTask = async (data: CreateTaskData) => {
    try {
      setError('');
      await api.createTask(data);
      await loadBoard(priorityFilter);
      setShowCreateForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId: number, data: UpdateTaskData) => {
    try {
      setError('');
      await api.updateTask(taskId, data);
      await loadBoard(priorityFilter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleMoveTask = async (taskId: number, columnId: number) => {
    try {
      setError('');
      await api.moveTask(taskId, columnId);
      await loadBoard(priorityFilter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move task');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      setError('');
      await api.deleteTask(taskId);
      await loadBoard(priorityFilter);
      setSelectedTaskId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const selectedTask = board?.columns
    .flatMap((col) => col.tasks)
    .find((task) => task.id === selectedTaskId);

  if (loading) return <Loading />;

  return (
    <div style={{ 
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ 
            margin: '0 0 0.25rem',
            fontSize: '1.75rem',
            fontWeight: '600',
            color: '#212529'
          }}>
            {board?.name}
          </h1>
          <p style={{ 
            margin: 0,
            fontSize: '0.95rem',
            color: '#6c757d'
          }}>
            Manage your team's tasks
          </p>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: '0.625rem 1.25rem',
            backgroundColor: '#0d6efd',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.95rem',
            fontWeight: '500'
          }}
        >
          {showCreateForm ? 'Cancel' : '+ New Task'}
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: '1.5rem' }}>
          <ErrorMessage message={error} onRetry={() => setError('')} />
        </div>
      )}

      <PriorityFilter value={priorityFilter} onChange={setPriorityFilter} />

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
        {board?.columns.map((column) => (
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
