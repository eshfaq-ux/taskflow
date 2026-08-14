import type { Priority } from '../types/task';

interface PriorityFilterProps {
  value: Priority | 'All';
  onChange: (priority: Priority | 'All') => void;
}

export default function PriorityFilter({ value, onChange }: PriorityFilterProps) {
  const priorities: Array<Priority | 'All'> = ['All', 'Low', 'Medium', 'High'];

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{
        display: 'inline-block',
        marginRight: '0.75rem',
        fontWeight: '500',
        color: '#495057',
        fontSize: '0.9rem'
      }}>
        Priority:
      </label>
      
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Priority | 'All')}
        style={{
          padding: '0.5rem 2rem 0.5rem 0.75rem',
          border: '1px solid #ced4da',
          borderRadius: '4px',
          fontSize: '0.9rem',
          backgroundColor: '#fff',
          cursor: 'pointer'
        }}
      >
        {priorities.map((priority) => (
          <option key={priority} value={priority}>
            {priority}
          </option>
        ))}
      </select>
    </div>
  );
}
