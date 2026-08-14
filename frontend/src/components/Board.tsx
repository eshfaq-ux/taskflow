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
      padding: '2rem',
      maxWidth: '1600px',
      margin: '0 auto',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '2rem',
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '0.5rem'
        }}>
          <span style={{ fontSize: '2rem' }}>📋</span>
          <h1 style={{ 
            margin: 0,
            fontSize: '2rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {board?.name}
          </h1>
        </div>
        <p style={{ 
          color: '#718096',
          margin: 0,
          fontSize: '1rem',
          fontWeight: '500'
        }}>
          Manage your team's tasks efficiently
        </p>
      </div>

      {error && (
        <div style={{ marginBottom: '1.5rem' }}>
          <ErrorMessage message={error} onRetry={() => setError('')} />
        </div>
      )}

      <PriorityFilter value={priorityFilter} onChange={setPriorityFilter} />

      <button
        onClick={() => setShowCreateForm(!showCreateForm)}
        style={{
          padding: '0.875rem 2rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)';
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>
          {showCreateForm ? '✕' : '+'}
        </span>
        {showCreateForm ? 'Cancel' : 'New Task'}
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
        gap: '1.5rem',
        overflowX: 'auto',
        paddingBottom: '2rem',
        scrollbarWidth: 'thin',
        scrollbarColor: '#cbd5e0 transparent'
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
