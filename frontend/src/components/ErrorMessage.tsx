interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div style={{
      padding: '1rem',
      backgroundColor: '#fee',
      border: '1px solid #fcc',
      borderRadius: '4px',
      color: '#c33',
      textAlign: 'center'
    }}>
      <p style={{ margin: '0 0 0.5rem' }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#c33',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Retry
        </button>
      )}
    </div>
  );
}
