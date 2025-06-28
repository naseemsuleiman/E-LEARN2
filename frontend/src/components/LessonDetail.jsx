import React, { useEffect, useState } from 'react';
import api from '../services/api';

const LessonDetail = ({ lesson, courseId }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await api.get(`/lessons/${lesson.id}/assignments/`);
        setAssignments(res.data);
      } catch (e) {
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, [lesson.id]);

  const handleMarkComplete = async () => {
    setMarking(true);
    try {
      const res = await api.post('/progress/mark/', { lesson_id: lesson.id, course_id: courseId });
      setProgress(res.data.percent_complete);
      if (window.showToast) window.showToast('Lesson marked as complete!', 'success');
    } catch {
      if (window.showToast) window.showToast('Failed to mark complete.', 'error');
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="mb-4">
      <h2 className="text-2xl font-bold mb-2">{lesson.title}</h2>
      <div className="mb-2 text-gray-700">{lesson.content}</div>
      {lesson.video_url && (
        <div className="mb-2">
          <a href={lesson.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Watch Video</a>
        </div>
      )}
      <button onClick={handleMarkComplete} className="bg-green-600 text-white px-4 py-2 rounded mt-2" disabled={marking}>
        {marking ? 'Marking...' : 'Mark as Complete'}
      </button>
      {progress !== null && (
        <div className="mt-2 text-purple-700 font-semibold">Course Progress: {progress.toFixed(1)}%</div>
      )}
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-1">Assignments</h3>
        {loading ? (
          <div>Loading assignments...</div>
        ) : assignments.length === 0 ? (
          <div>No assignments for this lesson.</div>
        ) : (
          <ul className="space-y-2">
            {assignments.map(a => (
              <li key={a.id} className="bg-gray-100 rounded p-2">
                <div className="font-bold">{a.title}</div>
                <div className="text-gray-600">Due: {a.due_date}</div>
                <div>{a.description}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LessonDetail;
