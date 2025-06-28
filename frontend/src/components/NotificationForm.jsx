import React, { useState } from 'react';

function NotificationForm({ courseId, onSuccess }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await window.api.postNotification(courseId, message);
      setMessage('');
      if (onSuccess) onSuccess(res);
      if (window.showToast) window.showToast('Notification sent!', 'success');
    } catch (err) {
      setError('Failed to send notification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 flex flex-col md:flex-row gap-2">
      <input
        type="text"
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Write a notification for students..."
        className="flex-1 border p-2 rounded"
        required
        disabled={loading}
      />
      <button
        type="submit"
        className="bg-purple-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Send Notification'}
      </button>
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </form>
  );
}

export default NotificationForm;
