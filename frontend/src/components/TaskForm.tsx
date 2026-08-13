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
      padding: '1rem',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#fff'
    }}>
      <h3 style={{ margin: 0 }}>Create New Task</h3>
      
      {error && (
        <div style={{ color: '#c33', padding: '0.5rem', backgroundColor: '#fee', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
          Title *
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
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem'
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description (optional)"
          rows={3}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem',
            resize: 'vertical'
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
          Priority
        </label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem'
          }}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
          Column
        </label>
        <select
          value={columnId}
          onChange={(e) => setColumnId(parseInt(e.target.value, 10))}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem'
          }}
        >
          {columns.map((col) => (
            <option key={col.id} value={col.id}>
              {col.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#fff',
            cursor: 'pointer'
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
            backgroundColor: '#007bff',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          Create Task
        </button>
      </div>
    </form>
  );
}
