export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
      padding: '3rem'
    }}>
      {/* Simple spinner with inline keyframe */}
      <style>{`
        @keyframes spinner-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
      
      <div style={{
        width: '48px',
        height: '48px',
        border: '4px solid #e9ecef',
        borderTopColor: '#0d6efd',
        borderRadius: '50%',
        animation: 'spinner-rotate 0.6s linear infinite'
      }} />
      
      {/* Loading text */}
      <p style={{
        marginTop: '1rem',
        fontSize: '0.95rem',
        color: '#6c757d'
      }}>
        Loading board...
      </p>
    </div>
  );
}
