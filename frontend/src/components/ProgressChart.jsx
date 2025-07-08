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
          <li key={p.id} className="bg-blue-50 rounded p-2">
            <div className="flex justify-between items-center">
              <span>{typeof p.course === 'string' ? p.course : p.course?.title || 'Unknown Course'}</span>
              <span className="font-bold">{p.percent_complete}%</span>
            </div>
            {/* Lesson progress */}
            {Array.isArray(p.lessons_progress) && p.lessons_progress.length > 0 && (
              <ul className="mt-2 space-y-1">
                {p.lessons_progress.map(lesson => (
                  <li key={lesson.lesson_id} className="flex items-center text-xs text-gray-700">
                    <span className="flex-1 truncate">{lesson.lesson_title}</span>
                    <span className="mx-2">{lesson.watched_duration}/{lesson.duration}s</span>
                    <span className="ml-2">
                      {lesson.is_completed ? (
                        <span className="text-green-600 font-bold">✓</span>
                      ) : (
                        <span>{lesson.duration > 0 ? Math.round((lesson.watched_duration / lesson.duration) * 100) : 0}%</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProgressChart;
