import { useState } from 'react';
import type { Priority, CreateTaskData } from '../types/task';

interface TaskFormProps {
  columns: { id: number; name: string }[];
  onSubmit: (data: CreateTaskData) => void;
  onCancel: () => void;
}

export default function TaskForm({ columns, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [columnId, setColumnId] = useState(columns[0]?.id ?? 1);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        columnId,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      padding: '1.5rem',
      border: '1px solid #dee2e6',
      borderRadius: '6px',
      backgroundColor: '#fff',
      marginBottom: '1.5rem'
    }}>
      <h3 style={{ 
        margin: '0 0 0.5rem',
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#212529'
      }}>
        Create New Task
      </h3>
      
      {error && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c2c7',
          borderRadius: '4px',
          color: '#842029',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      <div>
        <label style={{
          display: 'block',
          marginBottom: '0.375rem',
          fontWeight: '500',
          color: '#495057',
          fontSize: '0.9rem'
        }}>
          Title <span style={{ color: '#dc3545' }}>*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError('');
          }}
          placeholder="What needs to be done?"
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '0.95rem'
          }}
        />
      </div>

      <div>
        <label style={{
          display: 'block',
          marginBottom: '0.375rem',
          fontWeight: '500',
          color: '#495057',
          fontSize: '0.9rem'
        }}>
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add some details..."
          rows={3}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '0.95rem',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
      </div>

      <div>
        <label style={{
          display: 'block',
          marginBottom: '0.375rem',
          fontWeight: '500',
          color: '#495057',
          fontSize: '0.9rem'
        }}>
          Priority
        </label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '0.95rem',
            backgroundColor: '#fff',
            cursor: 'pointer'
          }}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      <div>
        <label style={{
          display: 'block',
          marginBottom: '0.375rem',
          fontWeight: '500',
          color: '#495057',
          fontSize: '0.9rem'
        }}>
          Column
        </label>
        <select
          value={columnId}
          onChange={(e) => setColumnId(parseInt(e.target.value, 10))}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '0.95rem',
            backgroundColor: '#fff',
            cursor: 'pointer'
          }}
        >
          {columns.map((col) => (
            <option key={col.id} value={col.id}>
              {col.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{
        display: 'flex',
        gap: '0.5rem',
        justifyContent: 'flex-end',
        paddingTop: '0.5rem'
      }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            backgroundColor: '#fff',
            color: '#495057',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#0d6efd',
            color: '#fff',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}
        >
          Create Task
        </button>
      </div>
    </form>
  );
}
