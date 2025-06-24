import { useState } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;
  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow-lg text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
      onClick={onClose}
      role="alert"
    >
      {message}
    </div>
  );
};

export default Toast;
