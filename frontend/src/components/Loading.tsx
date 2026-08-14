export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      gap: '1.5rem'
    }}>
      {/* Spinner */}
      <div style={{
        width: '60px',
        height: '60px',
        border: '4px solid rgba(102, 126, 234, 0.1)',
        borderTop: '4px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      
      {/* Loading text */}
      <div style={{
        fontSize: '1.1rem',
        color: '#fff',
        fontWeight: '500',
        textAlign: 'center'
      }}>
        Loading your board...
      </div>

      {/* Skeleton cards preview */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginTop: '2rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '900px'
      }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="skeleton"
            style={{
              width: '280px',
              height: '400px',
              borderRadius: '12px',
              opacity: 0.6
            }}
          />
        ))}
      </div>
    </div>
  );
}
