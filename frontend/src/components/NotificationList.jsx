import React, { useEffect, useState } from 'react';
import api from '../services/api';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications/');
        setNotifications(res.data);
      } catch (e) {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  if (loading) return <div>Loading notifications...</div>;
  if (!notifications.length) return <div>No notifications.</div>;

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Notifications</h2>
      <ul className="space-y-2">
        {notifications.map((n) => (
          <li key={n.id} className={`rounded p-2 ${n.is_read ? 'bg-gray-100' : 'bg-blue-100'}`}>
            <div>{n.message}</div>
            <div className="text-xs text-gray-500">{new Date(n.created_at).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationList;
