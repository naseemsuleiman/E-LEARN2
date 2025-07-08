import React, { useState } from 'react';
import apiService from '../services/api';

function NotificationForm({ courses, onSuccess }) {
  const [courseId, setCourseId] = useState(courses?.[0]?.id || '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiService.postNotification(courseId, message);
      setMessage('');
      if (onSuccess) onSuccess(res);
    } catch (err) {
      setError('Failed to send notification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 flex flex-col md:flex-row gap-2">
      <select
        value={courseId}
        onChange={e => setCourseId(e.target.value)}
        className="border p-2 rounded"
        required
        disabled={loading}
      >
        {courses && courses.map(course => (
          <option key={course.id} value={course.id}>{course.title}</option>
        ))}
      </select>
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
