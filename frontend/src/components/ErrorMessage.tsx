interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div style={{
      padding: '1.25rem 1.5rem',
      backgroundColor: '#fff',
      border: '2px solid #f56565',
      borderRadius: '12px',
      color: '#c53030',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(245, 101, 101, 0.15)',
      animation: 'fadeIn 0.3s ease'
    }}>
      {/* Error icon */}
      <div style={{
        width: '48px',
        height: '48px',
        margin: '0 auto 1rem',
        borderRadius: '50%',
        backgroundColor: '#fed7d7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px'
      }}>
        ⚠️
      </div>

      <p style={{ 
        margin: '0 0 1rem',
        fontSize: '1rem',
        fontWeight: '600',
        lineHeight: '1.5'
      }}>
        {message}
      </p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          style={{
            padding: '0.625rem 1.5rem',
            backgroundColor: '#f56565',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(245, 101, 101, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e53e3e';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 101, 101, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f56565';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(245, 101, 101, 0.3)';
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}
