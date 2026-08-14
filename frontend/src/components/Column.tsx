import type { Column as ColumnType } from '../types/task';
import TaskCard from './TaskCard';

interface ColumnProps {
  column: ColumnType;
  onTaskClick: (taskId: number) => void;
}

export default function Column({ column, onTaskClick }: ColumnProps) {
  return (
    <div
      style={{
        flex: '1 1 300px',
        minWidth: '300px',
        maxWidth: '380px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        padding: '1rem',
        border: '1px solid #dee2e6'
      }}
    >
      {/* Column Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        paddingBottom: '0.75rem',
        borderBottom: '2px solid #e9ecef'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '1rem',
          fontWeight: '600',
          color: '#212529'
        }}>
          {column.name}
        </h3>
        <span style={{
          fontSize: '0.85rem',
          color: '#6c757d',
          fontWeight: '500'
        }}>
          {column.tasks.length}
        </span>
      </div>
      
      {/* Tasks Container */}
      <div style={{
        minHeight: '100px',
        maxHeight: 'calc(100vh - 300px)',
        overflowY: 'auto'
      }}>
        {column.tasks.length === 0 ? (
          <div style={{
            padding: '2rem 1rem',
            textAlign: 'center',
            color: '#adb5bd',
            fontSize: '0.9rem'
          }}>
            No tasks
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
