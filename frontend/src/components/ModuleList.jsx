import React, { useEffect, useState } from 'react';
import api from '../services/api';
import LessonList from './LessonList';

const ModuleList = ({ courseId }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);

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
          <li key={mod.id} className="bg-gray-100 rounded p-2 cursor-pointer" onClick={() => setSelectedModule(mod)}>
            <div className="font-bold">{mod.title}</div>
            <div className="text-gray-600">{mod.description}</div>
          </li>
        ))}
      </ul>
      {selectedModule && (
        <div className="mt-4 p-4 bg-white rounded shadow">
          <button className="mb-2 text-purple-600 underline" onClick={() => setSelectedModule(null)}>
            &larr; Back to Modules
          </button>
          <LessonList moduleId={selectedModule.id} />
        </div>
      )}
    </div>
  );
};

export default ModuleList;
