import React from 'react';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0d0d2b 100%)'
    }}>
      <div className="spinner"></div>
      <p style={{
        marginTop: '20px',
        color: '#a0a0a0',
        fontSize: '1.1rem',
        textAlign: 'center'
      }}>
        {message}
      </p>
    </div>
  );
};

export default Loading;

