import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Board as BoardType, Priority, CreateTaskData, UpdateTaskData } from '../types/task';
import * as api from '../services/api';
import Column from './Column';
import TaskModal from './TaskModal';
import TaskForm from './TaskForm';
import PriorityFilter from './PriorityFilter';
import SearchBar from './SearchBar';
import ErrorMessage from './ErrorMessage';
import Loading from './Loading';

export default function Board() {
  const [board, setBoard] = useState<BoardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Debounce timer ref — avoids firing a request on every keystroke
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadBoard = useCallback(async (priority: Priority | 'All', search: string) => {
    try {
      setLoading(true);
      setError('');

      // Always fetch the full board to keep column metadata (id, name, position) current.
      const data = await api.getBoard(1);

      const trimmedSearch = search.trim();

      if (trimmedSearch) {
        // DATABASE-LEVEL title search — hits PostgreSQL ILIKE, returns only matching rows.
        const matchedTasks = await api.searchTasks(1, trimmedSearch);
        const columnsWithMatches = data.columns.map((col) => ({
          ...col,
          tasks: matchedTasks.filter((task) => task.column_id === col.id),
        }));
        setBoard({ ...data, columns: columnsWithMatches });
      } else if (priority !== 'All') {
        // DATABASE-LEVEL priority filter — hits PostgreSQL WHERE clause.
        const filteredTasks = await api.getTasksByPriority(1, priority);
        const columnsWithFilteredTasks = data.columns.map((col) => ({
          ...col,
          tasks: filteredTasks.filter((task) => task.column_id === col.id),
        }));
        setBoard({ ...data, columns: columnsWithFilteredTasks });
      } else {
        // No filter — show the full board as returned.
        setBoard(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load board');
    } finally {
      setLoading(false);
    }
  }, []);

  // Priority filter changes load immediately
  useEffect(() => {
    loadBoard(priorityFilter, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priorityFilter]);

  // Search input is debounced by 300 ms to avoid a request per keystroke
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      loadBoard(priorityFilter, value);
    }, 300);
  };

  const handlePriorityChange = (priority: Priority | 'All') => {
    // Clear search when switching priority filter so the two controls
    // don't silently combine and confuse the user.
    setSearchQuery('');
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    setPriorityFilter(priority);
  };

  const handleCreateTask = async (data: CreateTaskData) => {
    try {
      setError('');
      const newTask = await api.createTask(data);
      // Optimistic update: insert new task into state instead of full refetch
      if (board) {
        const updatedColumns = board.columns.map((col) =>
          col.id === newTask.column_id
            ? { ...col, tasks: [newTask, ...col.tasks] }
            : col
        );
        setBoard({ ...board, columns: updatedColumns });
      }
      setShowCreateForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId: number, data: UpdateTaskData) => {
    try {
      setError('');
      const updatedTask = await api.updateTask(taskId, data);
      // Optimistic update: update task in state
      if (board) {
        const updatedColumns = board.columns.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
        }));
        setBoard({ ...board, columns: updatedColumns });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleMoveTask = async (taskId: number, columnId: number) => {
    try {
      setError('');
      const movedTask = await api.moveTask(taskId, columnId);
      // Optimistic update: move task to new column
      if (board) {
        const updatedColumns = board.columns.map((col) => ({
          ...col,
          tasks: col.tasks.filter((t) => t.id !== taskId),
        }));
        const targetCol = updatedColumns.find((col) => col.id === columnId);
        if (targetCol) {
          targetCol.tasks.unshift(movedTask);
        }
        setBoard({ ...board, columns: updatedColumns });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move task');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      setError('');
      await api.deleteTask(taskId);
      // Optimistic update: remove task from state
      if (board) {
        const updatedColumns = board.columns.map((col) => ({
          ...col,
          tasks: col.tasks.filter((t) => t.id !== taskId),
        }));
        setBoard({ ...board, columns: updatedColumns });
      }
      setSelectedTaskId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  // Use memoization to avoid O(n) search on every render
  const selectedTask = useMemo(() => {
    if (!board || selectedTaskId === null) return undefined;
    for (const col of board.columns) {
      const found = col.tasks.find((task) => task.id === selectedTaskId);
      if (found) return found;
    }
    return undefined;
  }, [board, selectedTaskId]);

  if (loading) return <Loading />;

  return (
    <div
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1
            style={{
              margin: '0 0 0.25rem',
              fontSize: '1.75rem',
              fontWeight: '600',
              color: '#212529',
            }}
          >
            {board?.name}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '0.95rem',
              color: '#6c757d',
            }}
          >
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
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#0b5ed7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0d6efd';
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

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <PriorityFilter value={priorityFilter} onChange={handlePriorityChange} />
        <SearchBar value={searchQuery} onChange={handleSearchChange} />
        {(priorityFilter !== 'All' || searchQuery) && (
          <button
            onClick={() => {
              handlePriorityChange('All');
            }}
            style={{
              padding: '0.4rem 0.75rem',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              backgroundColor: '#fff',
              color: '#6c757d',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {showCreateForm && board && (
        <div style={{ marginBottom: '1.5rem' }}>
          <TaskForm
            columns={board.columns.map((col) => ({
              id: col.id,
              name: col.name,
            }))}
            onSubmit={handleCreateTask}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          overflowX: 'auto',
          paddingBottom: '1rem',
        }}
      >
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
          columns={board.columns.map((col) => ({
            id: col.id,
            name: col.name,
          }))}
          onUpdate={handleUpdateTask}
          onMove={handleMoveTask}
          onDelete={handleDeleteTask}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}
