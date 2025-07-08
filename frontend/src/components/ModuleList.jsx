import React, { useEffect, useState } from 'react';
import api from '../services/api';
import LessonList from './LessonList';

const ModuleList = ({ courseId, onLessonsAdded }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);
  const [newLessons, setNewLessons] = useState([
    { title: '', video_url: '', content: '' }
  ]);
  const [addingLesson, setAddingLesson] = useState(false);
  const [refreshLessons, setRefreshLessons] = useState(0);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await api.get(`/api/modules/?course=${courseId}`);
        setModules(res.data);
      } catch (e) {
        setModules([]);
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, [courseId]);

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

  // Add all lessons in the form to the first module (if exists)
  const handleAddAllLessons = async (e) => {
    e.preventDefault();
    if (!modules.length) return;
    try {
      await Promise.all(
        newLessons.filter(l => l.title.trim()).map(lesson =>
          api.post(`/api/modules/${modules[0].id}/lessons/`, lesson)
        )
      );
      setNewLessons([{ title: '', video_url: '', content: '' }]);
      setRefreshLessons(r => r + 1); // trigger lesson list refresh
      if (onLessonsAdded) onLessonsAdded();
    } catch (err) {
      alert('Error adding lessons');
    }
  };

  const handleLessonChange = (idx, field, value) => {
    setNewLessons(lessons =>
      lessons.map((l, i) => (i === idx ? { ...l, [field]: value } : l))
    );
  };

  const handleAddRow = () => {
    setNewLessons(lessons => [...lessons, { title: '', video_url: '', content: '' }]);
  };

  const handleRemoveRow = (idx) => {
    setNewLessons(lessons => lessons.length === 1 ? lessons : lessons.filter((_, i) => i !== idx));
  };

  if (loading) return <div>Loading modules...</div>;
  if (!modules.length) return (
    <div>
      <div className="mb-2 text-red-600">No modules found for this course.</div>
      <div className="mb-2 text-gray-700">You can add lessons directly (they will be attached to a new module if supported by backend):</div>
      <form onSubmit={handleAddAllLessons} className="space-y-4 bg-yellow-50 p-4 rounded">
        {newLessons.map((lesson, idx) => (
          <div key={idx} className="border-b pb-4 mb-4">
            <input type="text" placeholder="Lesson Title" value={lesson.title} onChange={e => handleLessonChange(idx, 'title', e.target.value)} className="w-full px-2 py-1 border rounded mb-2" required />
            <label className="block text-sm font-medium text-gray-700">Video URL (YouTube, Vimeo, or direct .mp4)</label>
            <input type="url" placeholder="https://..." value={lesson.video_url} onChange={e => handleLessonChange(idx, 'video_url', e.target.value)} className="w-full px-2 py-1 border rounded mb-2" />
            {isValidVideoUrl(lesson.video_url) && (
              <div className="my-2">
                {lesson.video_url.includes('youtube.com') || lesson.video_url.includes('youtu.be') || lesson.video_url.includes('vimeo.com') ? (
                  <iframe
                    src={lesson.video_url}
                    title="Lesson Video Preview"
                    className="w-full h-48"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video src={lesson.video_url} controls className="w-full h-48" />
                )}
              </div>
            )}
            <textarea placeholder="Content" value={lesson.content} onChange={e => handleLessonChange(idx, 'content', e.target.value)} className="w-full px-2 py-1 border rounded mb-2" />
            <div className="flex gap-2">
              <button type="button" className="px-2 py-1 bg-gray-300 rounded" onClick={() => handleRemoveRow(idx)} disabled={newLessons.length === 1}>Remove</button>
              {idx === newLessons.length - 1 && (
                <button type="button" className="px-2 py-1 bg-blue-500 text-white rounded" onClick={handleAddRow}>Add Row</button>
              )}
            </div>
          </div>
        ))}
        <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded">Add All Lessons</button>
      </form>
    </div>
  );

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
          <LessonList moduleId={selectedModule.id} refreshKey={refreshLessons} />
        </div>
      )}
      {/* Optionally, show add multiple lessons form for the first module */}
      {!selectedModule && modules.length > 0 && (
        <form onSubmit={handleAddAllLessons} className="mt-4 space-y-4 bg-yellow-50 p-4 rounded">
          {newLessons.map((lesson, idx) => (
            <div key={idx} className="border-b pb-4 mb-4">
              <input type="text" placeholder="Lesson Title" value={lesson.title} onChange={e => handleLessonChange(idx, 'title', e.target.value)} className="w-full px-2 py-1 border rounded mb-2" required />
              <label className="block text-sm font-medium text-gray-700">Video URL (YouTube, Vimeo, or direct .mp4)</label>
              <input type="url" placeholder="https://..." value={lesson.video_url} onChange={e => handleLessonChange(idx, 'video_url', e.target.value)} className="w-full px-2 py-1 border rounded mb-2" />
              {isValidVideoUrl(lesson.video_url) && (
                <div className="my-2">
                  {lesson.video_url.includes('youtube.com') || lesson.video_url.includes('youtu.be') || lesson.video_url.includes('vimeo.com') ? (
                    <iframe
                      src={lesson.video_url}
                      title="Lesson Video Preview"
                      className="w-full h-48"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <video src={lesson.video_url} controls className="w-full h-48" />
                  )}
                </div>
              )}
              <textarea placeholder="Content" value={lesson.content} onChange={e => handleLessonChange(idx, 'content', e.target.value)} className="w-full px-2 py-1 border rounded mb-2" />
              <div className="flex gap-2">
                <button type="button" className="px-2 py-1 bg-gray-300 rounded" onClick={() => handleRemoveRow(idx)} disabled={newLessons.length === 1}>Remove</button>
                {idx === newLessons.length - 1 && (
                  <button type="button" className="px-2 py-1 bg-blue-500 text-white rounded" onClick={handleAddRow}>Add Row</button>
                )}
              </div>
            </div>
          ))}
          <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded">Add All Lessons</button>
        </form>
      )}
    </div>
  );
};

export default ModuleList;
