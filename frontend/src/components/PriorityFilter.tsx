import type { Priority } from '../types/task';

interface PriorityFilterProps {
  value: Priority | 'All';
  onChange: (priority: Priority | 'All') => void;
}

export default function PriorityFilter({ value, onChange }: PriorityFilterProps) {
  const priorities: Array<Priority | 'All'> = ['All', 'Low', 'Medium', 'High'];

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>Filter by priority:</label>
      {priorities.map((priority) => (
        <label key={priority} style={{ marginRight: '1rem', cursor: 'pointer' }}>
          <input
            type="radio"
            name="priority"
            value={priority}
            checked={value === priority}
            onChange={() => onChange(priority)}
            style={{ marginRight: '0.25rem' }}
          />
          {priority}
        </label>
      ))}
    </div>
  );
}
