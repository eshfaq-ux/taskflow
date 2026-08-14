import type { Task, Priority } from '../types/task';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const getPriorityConfig = (priority: Priority) => {
    switch (priority) {
      case 'High':
        return {
          color: '#dc2626',
          bg: '#fee2e2',
          icon: '🔴',
          label: 'High Priority'
        };
      case 'Medium':
        return {
          color: '#ea580c',
          bg: '#ffedd5',
          icon: '🟡',
          label: 'Medium Priority'
        };
      case 'Low':
        return {
          color: '#16a34a',
          bg: '#dcfce7',
          icon: '🟢',
          label: 'Low Priority'
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const priorityConfig = getPriorityConfig(task.priority);

  return (
    <div
      onClick={onClick}
      className="fade-in"
      style={{
        padding: '1.25rem',
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        marginBottom: '0.875rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = '#cbd5e0';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = '#e2e8f0';
      }}
    >
      {/* Priority indicator bar */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '4px',
        backgroundColor: priorityConfig.color,
        borderTopLeftRadius: '10px',
        borderBottomLeftRadius: '10px'
      }} />

      {/* Header: Title + Priority Badge */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'start',
        marginBottom: '0.75rem',
        gap: '0.75rem'
      }}>
        <h4 style={{ 
          margin: 0,
          fontSize: '1rem',
          fontWeight: '600',
          flex: 1,
          color: '#1a202c',
          lineHeight: '1.4'
        }}>
          {task.title}
        </h4>
        <span
          title={priorityConfig.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.65rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '700',
            backgroundColor: priorityConfig.bg,
            color: priorityConfig.color,
            whiteSpace: 'nowrap',
            border: `1px solid ${priorityConfig.color}30`
          }}
        >
          <span style={{ fontSize: '0.65rem' }}>{priorityConfig.icon}</span>
          {task.priority}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p style={{
          margin: '0 0 0.875rem 0',
          fontSize: '0.9rem',
          color: '#4a5568',
          lineHeight: '1.5',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {task.description}
        </p>
      )}

      {/* Footer: Created date */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid #f7fafc'
      }}>
        <span style={{ fontSize: '0.85rem', opacity: 0.6 }}>🕐</span>
        <span style={{
          fontSize: '0.8rem',
          color: '#718096',
          fontWeight: '500'
        }}>
          {formatDate(task.created_at)}
        </span>
      </div>
    </div>
  );
}
