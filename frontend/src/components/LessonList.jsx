import React, { useEffect, useState } from 'react';
import api from '../services/api';
import LessonDetail from './LessonDetail';
import { getLessonProgress, setLessonProgress } from '../services/lms';

const LessonList = ({ moduleId, refreshKey }) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [newLesson, setNewLesson] = useState({ title: '', video_url: '', content: '' });
  const [editLessonId, setEditLessonId] = useState(null);
  const [editLesson, setEditLesson] = useState({ title: '', video_url: '', content: '' });
  const [lessonProgress, setLessonProgressState] = useState({});

  // Helper to fetch lessons
  const fetchLessons = async () => {
    try {
      const res = await api.get(`/api/modules/${moduleId}/lessons/`);
      setLessons(res.data);
    } catch (e) {
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [moduleId, refreshKey]);

  // Fetch lesson progress for all lessons
  useEffect(() => {
    const fetchProgress = async () => {
      const progressMap = {};
      for (const lesson of lessons) {
        try {
          const progress = await getLessonProgress(lesson.id);
          progressMap[lesson.id] = progress.is_completed;
        } catch {
          progressMap[lesson.id] = false;
        }
      }
      setLessonProgressState(progressMap);
    };
    if (lessons.length > 0) fetchProgress();
  }, [lessons]);

  const handleAddLesson = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/modules/${moduleId}/lessons/`, newLesson);
      setNewLesson({ title: '', video_url: '', content: '' });
      fetchLessons(); // Always refresh after add
    } catch (err) {
      alert('Error adding lesson');
    }
  };

  const handleEditLesson = (lesson) => {
    setEditLessonId(lesson.id);
    setEditLesson({ title: lesson.title, video_url: lesson.video_url || '', content: lesson.content || '' });
  };

  const handleUpdateLesson = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/lessons/${editLessonId}/`, editLesson);
      setEditLessonId(null);
      setEditLesson({ title: '', video_url: '', content: '' });
      fetchLessons(); // Always refresh after edit
    } catch (err) {
      alert('Error updating lesson');
    }
  };

  const handleMarkLesson = async (lessonId) => {
    await setLessonProgress(lessonId);
    setLessonProgressState(prev => ({ ...prev, [lessonId]: true }));
  };

  // Helper to check if a string is a valid video URL (YouTube, Vimeo, or direct video)
  const isValidVideoUrl = (url) => {
    if (!url) return false;
    return (
      url.includes('youtube.com') ||
      url.includes('youtu.be') ||
      url.includes('vimeo.com') ||
      url.match(/\.(mp4|webm|ogg)$/)
    );
  };

  if (loading) return <div>Loading lessons...</div>;
  if (!lessons.length) return (
    <div>
      <div>No lessons found.</div>
      {/* Always show Add Lesson form */}
      <form onSubmit={handleAddLesson} className="mt-4 space-y-2 bg-yellow-50 p-4 rounded">
        <input type="text" placeholder="Lesson Title" value={newLesson.title} onChange={e => setNewLesson({ ...newLesson, title: e.target.value })} className="w-full px-2 py-1 border rounded" required />
        <label className="block text-sm font-medium text-gray-700">Video URL (YouTube, Vimeo, or direct .mp4)</label>
        <input type="url" placeholder="https://..." value={newLesson.video_url} onChange={e => setNewLesson({ ...newLesson, video_url: e.target.value })} className="w-full px-2 py-1 border rounded" />
        {isValidVideoUrl(newLesson.video_url) && (
          <div className="my-2">
            {newLesson.video_url.includes('youtube.com') || newLesson.video_url.includes('youtu.be') || newLesson.video_url.includes('vimeo.com') ? (
              <iframe
                src={newLesson.video_url}
                title="Lesson Video Preview"
                className="w-full h-48"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <video src={newLesson.video_url} controls className="w-full h-48" />
            )}
          </div>
        )}
        <textarea placeholder="Content" value={newLesson.content} onChange={e => setNewLesson({ ...newLesson, content: e.target.value })} className="w-full px-2 py-1 border rounded" />
        <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded">Add Lesson</button>
      </form>
    </div>
  );

  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-1">Lessons</h3>
      {/* Always show Add Lesson form */}
      <form onSubmit={handleAddLesson} className="mb-4 space-y-2 bg-yellow-50 p-4 rounded">
        <input type="text" placeholder="Lesson Title" value={newLesson.title} onChange={e => setNewLesson({ ...newLesson, title: e.target.value })} className="w-full px-2 py-1 border rounded" required />
        <label className="block text-sm font-medium text-gray-700">Video URL (YouTube, Vimeo, or direct .mp4)</label>
        <input type="url" placeholder="https://..." value={newLesson.video_url} onChange={e => setNewLesson({ ...newLesson, video_url: e.target.value })} className="w-full px-2 py-1 border rounded" />
        {isValidVideoUrl(newLesson.video_url) && (
          <div className="my-2">
            {newLesson.video_url.includes('youtube.com') || newLesson.video_url.includes('youtu.be') || newLesson.video_url.includes('vimeo.com') ? (
              <iframe
                src={newLesson.video_url}
                title="Lesson Video Preview"
                className="w-full h-48"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <video src={newLesson.video_url} controls className="w-full h-48" />
            )}
          </div>
        )}
        <textarea placeholder="Content" value={newLesson.content} onChange={e => setNewLesson({ ...newLesson, content: e.target.value })} className="w-full px-2 py-1 border rounded" />
        <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded">Add Lesson</button>
      </form>
      <ul className="space-y-2">
        {lessons.map((lesson) => (
          <li key={lesson.id} className="bg-yellow-50 rounded p-2 flex items-center justify-between">
            <div>
              <div className="font-bold flex items-center">
                <span>{lesson.title}</span>
                {lessonProgress[lesson.id] && <span className="ml-2 text-green-600">&#10003;</span>}
              </div>
              <div className="text-gray-600">{lesson.content.slice(0, 100)}...</div>
                {lesson.video_url && (
                  <span>
                    {lesson.video_url.includes('youtube.com') || lesson.video_url.includes('youtu.be') || lesson.video_url.includes('vimeo.com') ? (
                      <iframe
                        src={lesson.video_url}
                        title="Lesson Video"
                        className="w-full h-48 my-2"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <video src={lesson.video_url} controls className="w-full h-48 my-2" />
                    )}
                  </span>
                )}
                {lesson.file_attachment && (
                  <video src={lesson.file_attachment} controls className="w-full h-48 my-2" />
                )}
            </div>
            <div>
              {!lessonProgress[lesson.id] && (
                <button className="ml-2 px-2 py-1 text-xs bg-green-600 text-white rounded" onClick={() => handleMarkLesson(lesson.id)}>
                  Mark Complete
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {selectedLesson && (
        <div className="mt-4 p-4 bg-white rounded shadow">
          <button className="mb-2 text-purple-600 underline" onClick={() => setSelectedLesson(null)}>
            &larr; Back to Lessons
          </button>
          <LessonDetail lesson={selectedLesson} courseId={lessons[0]?.module?.course || null} />
        </div>
      )}
    </div>
  );
};

export default LessonList;
