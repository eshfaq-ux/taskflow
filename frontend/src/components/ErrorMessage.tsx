interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div style={{
      padding: '1rem',
      backgroundColor: '#f8d7da',
      border: '1px solid #f5c2c7',
      borderRadius: '6px',
      color: '#842029'
    }}>
      <p style={{ margin: '0 0 0.75rem', fontWeight: '500' }}>
        {message}
      </p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}
