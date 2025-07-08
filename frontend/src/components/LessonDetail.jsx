import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { getLessonProgress, setLessonProgress, getCourseProgress } from '../services/lms';

const LessonDetail = ({ lesson, courseId }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [progress, setProgress] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

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
    // Fetch lesson progress
    getLessonProgress(lesson.id).then(res => setIsCompleted(res.is_completed)).catch(() => setIsCompleted(false));
  }, [lesson.id]);

  const handleMarkComplete = async () => {
    setMarking(true);
    try {
      await setLessonProgress(lesson.id);
      setIsCompleted(true);
      // Optionally update course progress
      if (courseId) {
        const progress = await getCourseProgress(courseId);
        setProgress(progress.percent_complete);
      }
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
      <button onClick={handleMarkComplete} className="bg-green-600 text-white px-4 py-2 rounded mt-2" disabled={marking || isCompleted}>
        {isCompleted ? 'Completed 5f9' : (marking ? 'Marking...' : 'Mark as Complete')}
      </button>
      {isCompleted && <div className="mt-2 text-green-600 font-semibold">Lesson completed! &#10003;</div>}
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
