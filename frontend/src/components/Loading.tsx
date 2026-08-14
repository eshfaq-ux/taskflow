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
      {/* Spinner with visible colors */}
      <div style={{
        width: '64px',
        height: '64px',
        border: '5px solid rgba(255, 255, 255, 0.3)',
        borderTop: '5px solid #fff',
        borderRight: '5px solid #a78bfa',
        borderBottom: '5px solid #8b5cf6',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        boxShadow: '0 4px 20px rgba(139, 92, 246, 0.5)'
      }} />
      
      {/* Loading text */}
      <div style={{
        fontSize: '1.25rem',
        color: '#fff',
        fontWeight: '600',
        textAlign: 'center',
        textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
      }}>
        Loading your board...
      </div>

      {/* Subtle hint text */}
      <div style={{
        fontSize: '0.9rem',
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        maxWidth: '400px',
        lineHeight: '1.5',
        textShadow: '0 1px 4px rgba(0, 0, 0, 0.2)'
      }}>
        Fetching tasks from the database
      </div>
    </div>
  );
}
