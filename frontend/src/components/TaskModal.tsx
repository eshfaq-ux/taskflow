import { useState } from 'react';
import type { Task, Priority, UpdateTaskData } from '../types/task';

interface TaskModalProps {
  task: Task;
  columns: { id: number; name: string }[];
  onUpdate: (taskId: number, data: UpdateTaskData) => void;
  onMove: (taskId: number, columnId: number) => void;
  onDelete: (taskId: number) => void;
  onClose: () => void;
}

export default function TaskModal({ task, columns, onUpdate, onMove, onDelete, onClose }: TaskModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [error, setError] = useState('');

  const handleUpdate = () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    onUpdate(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    // Using browser confirm is acceptable for this assignment,
    // but a custom modal would be better for production
    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"? This action cannot be undone.`
    );
    if (confirmed) {
      onDelete(task.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case 'High': return '#d73a49';
      case 'Medium': return '#fb8500';
      case 'Low': return '#22863a';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {isEditing ? (
          <>
            <h2 style={{ marginTop: 0 }}>Edit Task</h2>
            
            {error && (
              <div style={{ color: '#c33', padding: '0.5rem', backgroundColor: '#fee', borderRadius: '4px', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
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
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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

            <div style={{ marginBottom: '1rem' }}>
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

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsEditing(false)}
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
                onClick={handleUpdate}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                Save Changes
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, flex: 1 }}>{task.title}</h2>
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  backgroundColor: getPriorityColor(task.priority) + '20',
                  color: getPriorityColor(task.priority),
                }}
              >
                {task.priority}
              </span>
            </div>

            {task.description && (
              <p style={{ color: '#666', lineHeight: '1.6' }}>{task.description}</p>
            )}

            <p style={{ color: '#999', fontSize: '0.9rem', marginTop: '1rem' }}>
              Created: {formatDate(task.created_at)}
            </p>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Move to:
              </label>
              <select
                value={task.column_id}
                onChange={(e) => onMove(task.id, parseInt(e.target.value, 10))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  marginBottom: '1rem'
                }}
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button
                onClick={handleDelete}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #007bff',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    color: '#007bff',
                    cursor: 'pointer'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={onClose}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
