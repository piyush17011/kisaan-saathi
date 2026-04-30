import React, { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose, duration = 3500 }) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  return (
    <div className={`ks-toast${type === 'error' ? ' error' : ''}`}>
      {message}
    </div>
  );
}
