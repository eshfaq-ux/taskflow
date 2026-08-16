import { memo, useCallback } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar = memo(function SearchBar({ value, onChange }: SearchBarProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div style={{ position: 'relative', minWidth: '250px' }}>
      <input
        type="text"
        placeholder="Search tasks..."
        value={value}
        onChange={handleChange}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          border: '1px solid #ced4da',
          borderRadius: '4px',
          fontSize: '0.9rem',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#0d6efd';
          e.currentTarget.style.outline = 'none';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#ced4da';
        }}
      />
    </div>
  );
});

export default SearchBar;
