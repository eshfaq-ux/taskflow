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
        minWidth: '280px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        padding: '1rem',
      }}
    >
      <h3 style={{
        margin: '0 0 1rem',
        fontSize: '1.1rem',
        color: '#333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {column.name}
        <span style={{
          fontSize: '0.9rem',
          color: '#666',
          fontWeight: 'normal',
          backgroundColor: '#e0e0e0',
          padding: '0.2rem 0.6rem',
          borderRadius: '12px'
        }}>
          {column.tasks.length}
        </span>
      </h3>
      
      <div>
        {column.tasks.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: '2rem 0' }}>
            No tasks
          </p>
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
