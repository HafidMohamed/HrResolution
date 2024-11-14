
import React from 'react';
import { useSelector } from 'react-redux';

const DebugAuthState = () => {
  const auth = useSelector((state) => state.auth);

  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, background: '#f0f0f0', padding: '10px', fontSize: '12px' }}>
      <pre>{JSON.stringify(auth, null, 2)}</pre>
    </div>
  );
};

export default DebugAuthState;