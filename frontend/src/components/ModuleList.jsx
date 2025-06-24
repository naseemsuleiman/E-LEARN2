import React, { useEffect, useState } from 'react';
import api from '../services/api';

const ModuleList = ({ courseId }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await api.get(`/modules/?course=${courseId}`);
        setModules(res.data);
      } catch (e) {
        setModules([]);
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, [courseId]);

  if (loading) return <div>Loading modules...</div>;
  if (!modules.length) return <div>No modules found.</div>;

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Modules</h2>
      <ul className="space-y-2">
        {modules.map((mod) => (
          <li key={mod.id} className="bg-gray-100 rounded p-2">
            <div className="font-bold">{mod.title}</div>
            <div className="text-gray-600">{mod.description}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ModuleList;
