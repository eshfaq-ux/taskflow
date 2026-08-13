import type { Task, Priority } from '../types/task';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'High': return '#d73a49';
      case 'Medium': return '#fb8500';
      case 'Low': return '#22863a';
    }
  };

  return (
    <div
      onClick={onClick}
      style={{
        padding: '1rem',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '6px',
        marginBottom: '0.75rem',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', flex: 1 }}>{task.title}</h4>
        <span
          style={{
            padding: '0.15rem 0.5rem',
            borderRadius: '10px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            backgroundColor: getPriorityColor(task.priority) + '20',
            color: getPriorityColor(task.priority),
            whiteSpace: 'nowrap',
            marginLeft: '0.5rem'
          }}
        >
          {task.priority}
        </span>
      </div>
      {task.description && (
        <p style={{
          margin: 0,
          fontSize: '0.9rem',
          color: '#666',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {task.description}
        </p>
      )}
    </div>
  );
}
