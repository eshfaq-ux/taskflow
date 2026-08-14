import type { Task, Priority } from '../types/task';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'High': return { bg: '#f8d7da', text: '#842029' };
      case 'Medium': return { bg: '#fff3cd', text: '#997404' };
      case 'Low': return { bg: '#d1e7dd', text: '#0f5132' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const priorityColors = getPriorityColor(task.priority);

  return (
    <div
      onClick={onClick}
      style={{
        padding: '1rem',
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '6px',
        marginBottom: '0.75rem',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.borderColor = '#adb5bd';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = '#dee2e6';
      }}
    >
      {/* Title */}
      <h4 style={{ 
        margin: '0 0 0.5rem',
        fontSize: '0.95rem',
        fontWeight: '500',
        color: '#212529',
        lineHeight: '1.4'
      }}>
        {task.title}
      </h4>

      {/* Description */}
      {task.description && (
        <p style={{
          margin: '0 0 0.75rem',
          fontSize: '0.875rem',
          color: '#6c757d',
          lineHeight: '1.4',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {task.description}
        </p>
      )}

      {/* Footer: Priority + Date */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '0.75rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid #f1f3f5'
      }}>
        <span style={{
          display: 'inline-block',
          padding: '0.25rem 0.5rem',
          borderRadius: '3px',
          fontSize: '0.75rem',
          fontWeight: '600',
          backgroundColor: priorityColors.bg,
          color: priorityColors.text,
          textTransform: 'uppercase',
          letterSpacing: '0.3px'
        }}>
          {task.priority}
        </span>

        <span style={{
          fontSize: '0.8rem',
          color: '#868e96'
        }}>
          {formatDate(task.created_at)}
        </span>
      </div>
    </div>
  );
}
