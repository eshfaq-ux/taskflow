interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Search icon */}
      <span style={{
        position: 'absolute',
        left: '0.65rem',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#adb5bd',
        fontSize: '0.9rem',
        pointerEvents: 'none',
        lineHeight: 1
      }}>
        🔍
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search tasks…"
        aria-label="Search tasks by title"
        style={{
          paddingLeft: '2rem',
          paddingRight: value ? '2rem' : '0.75rem',
          paddingTop: '0.5rem',
          paddingBottom: '0.5rem',
          border: '1px solid #ced4da',
          borderRadius: '4px',
          fontSize: '0.9rem',
          width: '220px',
          backgroundColor: '#fff',
          outline: 'none',
        }}
      />
    </div>
  );
}
