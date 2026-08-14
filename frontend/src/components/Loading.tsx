export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      gap: '1.5rem',
      padding: '2rem'
    }}>
      {/* Spinner */}
      <div style={{
        width: '64px',
        height: '64px',
        border: '5px solid rgba(255, 255, 255, 0.2)',
        borderTop: '5px solid #fff',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
      }} />
      
      {/* Loading text */}
      <div style={{
        fontSize: '1.25rem',
        color: '#fff',
        fontWeight: '600',
        textAlign: 'center',
        textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
      }}>
        Loading your board...
      </div>

      {/* Subtle hint text */}
      <div style={{
        fontSize: '0.9rem',
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        maxWidth: '400px',
        lineHeight: '1.5'
      }}>
        Fetching tasks from the database
      </div>
    </div>
  );
}
