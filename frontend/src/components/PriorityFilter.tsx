import { memo, useCallback } from 'react';
import type { Priority } from '../types/task';

interface PriorityFilterProps {
  value: Priority | 'All';
  onChange: (priority: Priority | 'All') => void;
}

const PriorityFilter = memo(function PriorityFilter({
  value,
  onChange,
}: PriorityFilterProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange((e.target.value as Priority) | ('All' as const));
    },
    [onChange]
  );

  return (
    <div>
      <label htmlFor="priority-filter" style={{ marginRight: '0.5rem', fontSize: '0.9rem' }}>
        Priority:
      </label>
      <select
        id="priority-filter"
        value={value}
        onChange={handleChange}
        style={{
          padding: '0.4rem 0.75rem',
          border: '1px solid #ced4da',
          borderRadius: '4px',
          fontSize: '0.9rem',
          backgroundColor: '#fff',
          cursor: 'pointer',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#0d6efd';
          e.currentTarget.style.outline = 'none';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#ced4da';
        }}
      >
        <option value="All">All</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
    </div>
  );
});

export default PriorityFilter;
