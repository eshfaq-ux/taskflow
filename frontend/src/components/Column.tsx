import type { Column as ColumnType } from '../types/task';
import TaskCard from './TaskCard';

interface ColumnProps {
  column: ColumnType;
  onTaskClick: (taskId: number) => void;
}

export default function Column({ column, onTaskClick }: ColumnProps) {
  const getColumnColor = (name: string) => {
    switch (name.toLowerCase()) {
      case 'to do': return { bg: '#fef3c7', border: '#fbbf24', badge: '#f59e0b' };
      case 'in progress': return { bg: '#dbeafe', border: '#60a5fa', badge: '#3b82f6' };
      case 'done': return { bg: '#d1fae5', border: '#34d399', badge: '#10b981' };
      default: return { bg: '#f3f4f6', border: '#9ca3af', badge: '#6b7280' };
    }
  };

  const colors = getColumnColor(column.name);

  return (
    <div
      className="fade-in"
      style={{
        flex: '1 1 320px',
        minWidth: '320px',
        maxWidth: '380px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '1.25rem',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        border: `2px solid ${colors.border}20`,
        transition: 'all 0.2s ease'
      }}
    >
      {/* Column Header */}
      <div style={{
        marginBottom: '1.25rem',
        paddingBottom: '1rem',
        borderBottom: `2px solid ${colors.bg}`,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '1.1rem',
            fontWeight: '700',
            color: '#2d3748',
            letterSpacing: '0.3px'
          }}>
            {column.name}
          </h3>
          <span style={{
            fontSize: '0.85rem',
            color: '#fff',
            fontWeight: '700',
            backgroundColor: colors.badge,
            padding: '0.35rem 0.75rem',
            borderRadius: '20px',
            minWidth: '32px',
            textAlign: 'center',
            boxShadow: `0 2px 8px ${colors.badge}40`
          }}>
            {column.tasks.length}
          </span>
        </div>
      </div>
      
      {/* Tasks Container */}
      <div style={{
        minHeight: '200px',
        maxHeight: 'calc(100vh - 400px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollbarWidth: 'thin',
        scrollbarColor: '#cbd5e0 transparent',
        paddingRight: '0.25rem'
      }}>
        {column.tasks.length === 0 ? (
          <div style={{
            padding: '3rem 1rem',
            textAlign: 'center',
            color: '#a0aec0',
            fontWeight: '500',
            fontSize: '0.95rem',
            backgroundColor: colors.bg,
            borderRadius: '8px',
            border: `2px dashed ${colors.border}50`
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
            No tasks yet
          </div>
        ) : (
          column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
