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
      gap: '1.25rem',
      padding: '1.75rem',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      backgroundColor: '#fff',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        paddingBottom: '0.75rem',
        borderBottom: '2px solid #f7fafc'
      }}>
        <span style={{ fontSize: '1.5rem' }}>✨</span>
        <h3 style={{ margin: 0, color: '#2d3748', fontWeight: '700' }}>
          Create New Task
        </h3>
      </div>
      
      {error && (
        <div style={{
          color: '#c53030',
          padding: '0.875rem 1rem',
          backgroundColor: '#fed7d7',
          borderRadius: '8px',
          fontSize: '0.9rem',
          fontWeight: '500',
          border: '1px solid #fc8181'
        }}>
          ⚠️ {error}
        </div>
      )}

      <div>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontWeight: '600',
          color: '#2d3748',
          fontSize: '0.9rem'
        }}>
          Title <span style={{ color: '#e53e3e' }}>*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError('');
          }}
          placeholder="Enter task title"
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '1rem',
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#667eea';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      <div>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontWeight: '600',
          color: '#2d3748',
          fontSize: '0.9rem'
        }}>
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description (optional)"
          rows={3}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '1rem',
            resize: 'vertical',
            transition: 'all 0.2s ease',
            outline: 'none',
            fontFamily: 'inherit'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#667eea';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      <div>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontWeight: '600',
          color: '#2d3748',
          fontSize: '0.9rem'
        }}>
          Priority
        </label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '1rem',
            backgroundColor: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#667eea';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <option value="Low">🟢 Low</option>
          <option value="Medium">🟡 Medium</option>
          <option value="High">🔴 High</option>
        </select>
      </div>

      <div>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontWeight: '600',
          color: '#2d3748',
          fontSize: '0.9rem'
        }}>
          Column
        </label>
        <select
          value={columnId}
          onChange={(e) => setColumnId(parseInt(e.target.value, 10))}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '1rem',
            backgroundColor: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#667eea';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.boxShadow = 'none';
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
        gap: '0.75rem',
        justifyContent: 'flex-end',
        paddingTop: '0.5rem'
      }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '0.75rem 1.5rem',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            backgroundColor: '#fff',
            color: '#4a5568',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f7fafc';
            e.currentTarget.style.borderColor = '#cbd5e0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            padding: '0.75rem 2rem',
            border: 'none',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
          }}
        >
          Create Task
        </button>
      </div>
    </form>
  );
}
