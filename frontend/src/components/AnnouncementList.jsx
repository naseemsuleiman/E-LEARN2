import React, { useEffect, useState } from 'react';
import api from '../services/api';

const AnnouncementList = ({ courseId }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get(`/announcements/?course=${courseId}`);
        setAnnouncements(res.data);
      } catch (e) {
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, [courseId]);

  if (loading) return <div>Loading announcements...</div>;
  if (!announcements.length) return <div>No announcements found.</div>;

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Announcements</h2>
      <ul className="space-y-2">
        {announcements.map((a) => (
          <li key={a.id} className="bg-blue-50 rounded p-2">
            <div className="font-bold">{a.title}</div>
            <div className="text-gray-600">{a.content}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AnnouncementList;
