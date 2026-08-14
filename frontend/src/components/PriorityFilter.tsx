import type { Priority } from '../types/task';

interface PriorityFilterProps {
  value: Priority | 'All';
  onChange: (priority: Priority | 'All') => void;
}

export default function PriorityFilter({ value, onChange }: PriorityFilterProps) {
  const priorities: Array<Priority | 'All'> = ['All', 'High', 'Medium', 'Low'];

  const getFilterColor = (priority: Priority | 'All') => {
    switch (priority) {
      case 'High': return '#d73a49';
      case 'Medium': return '#fb8500';
      case 'Low': return '#22863a';
      default: return '#667eea';
    }
  };

  return (
    <div style={{ 
      marginBottom: '1.5rem',
      padding: '1rem',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      backdropFilter: 'blur(10px)'
    }}>
      <label style={{ 
        display: 'block',
        marginBottom: '0.75rem',
        fontWeight: '600',
        color: '#2d3748',
        fontSize: '0.95rem',
        letterSpacing: '0.3px'
      }}>
        📊 Filter by Priority
      </label>
      
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}>
        {priorities.map((priority) => {
          const isActive = value === priority;
          const color = getFilterColor(priority);
          
          return (
            <button
              key={priority}
              onClick={() => onChange(priority)}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                border: isActive ? `2px solid ${color}` : '2px solid transparent',
                backgroundColor: isActive ? color : '#f7fafc',
                color: isActive ? '#fff' : '#4a5568',
                fontSize: '0.9rem',
                fontWeight: isActive ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? `0 4px 12px ${color}40` : '0 1px 3px rgba(0, 0, 0, 0.1)',
                transform: isActive ? 'translateY(-1px)' : 'translateY(0)'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#edf2f7';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.12)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#f7fafc';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                }
              }}
            >
              {priority}
              {isActive && ' ✓'}
            </button>
          );
        })}
      </div>
    </div>
  );
}
