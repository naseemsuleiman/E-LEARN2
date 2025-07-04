import React, { useEffect, useState } from 'react';
import apiService, { api } from '../services/api';

const ProgressChart = () => {
  const [progress, setProgress] = useState([]);
  useEffect(() => {
    api.get('/api/progress/').then(res => setProgress(res.data));
  }, []);

  if (!progress.length) return <div>No progress data yet.</div>;

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Your Progress</h2>
      <ul className="space-y-2">
        {progress.map(p => (
          <li key={p.id} className="bg-blue-50 rounded p-2 flex justify-between items-center">
            <span>{typeof p.course === 'string' ? p.course : p.course?.title || 'Unknown Course'}</span>
            <span className="font-bold">{p.percent_complete}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProgressChart;
