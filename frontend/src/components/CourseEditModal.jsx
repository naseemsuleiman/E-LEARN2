import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function CourseEditModal({ course, onClose, onSave }) {
  const [title, setTitle] = useState(course.title || '');
  const [description, setDescription] = useState(course.description || '');
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newLesson, setNewLesson] = useState({ title: '', content: '', module: '', lesson_type: 'video' });
  const [editingLesson, setEditingLesson] = useState(null);

  useEffect(() => {
    fetchModulesAndLessons();
    // eslint-disable-next-line
  }, [course.id]);

  const fetchModulesAndLessons = async () => {
    setLoading(true);
    try {
      const modulesRes = await api.get(`/api/courses/${course.id}/modules/`);
      setModules(modulesRes.data);
      // Fetch all lessons for all modules
      let allLessons = [];
      for (const mod of modulesRes.data) {
        const lessonsRes = await api.get(`/api/modules/${mod.id}/lessons/`);
        allLessons = allLessons.concat(lessonsRes.data.map(l => ({ ...l, module: mod.id, moduleTitle: mod.title })));
      }
      setLessons(allLessons);
    } catch (e) {
      setModules([]);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!newLesson.title || !newLesson.module) return;
    await api.post(`/api/modules/${newLesson.module}/lessons/`, newLesson);
    setNewLesson({ title: '', content: '', module: '', lesson_type: 'video' });
    fetchModulesAndLessons();
  };

  const handleEditLesson = async (lesson) => {
    setEditingLesson(lesson);
  };

  const handleUpdateLesson = async (e) => {
    e.preventDefault();
    await api.put(`/api/lessons/${editingLesson.id}/`, editingLesson);
    setEditingLesson(null);
    fetchModulesAndLessons();
  };

  const handleDeleteLesson = async (lessonId) => {
    await api.delete(`/api/lessons/${lessonId}/`);
    fetchModulesAndLessons();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...course, title, description });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4">Edit Course</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border rounded p-2"
              rows={3}
              required
            />
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-2">Lessons</h3>
            {loading ? (
              <div>Loading lessons...</div>
            ) : (
              <>
                {/* Add Lesson Form */}
                <form onSubmit={handleAddLesson} className="mb-4 flex flex-col md:flex-row gap-2 items-end">
                  <select
                    value={newLesson.module}
                    onChange={e => setNewLesson({ ...newLesson, module: e.target.value })}
                    className="border rounded p-2"
                    required
                  >
                    <option value="">Select Module</option>
                    {modules.map(mod => (
                      <option key={mod.id} value={mod.id}>{mod.title}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Lesson Title"
                    value={newLesson.title}
                    onChange={e => setNewLesson({ ...newLesson, title: e.target.value })}
                    className="border rounded p-2 flex-1"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Content/Video URL"
                    value={newLesson.content}
                    onChange={e => setNewLesson({ ...newLesson, content: e.target.value })}
                    className="border rounded p-2 flex-1"
                  />
                  <select
                    value={newLesson.lesson_type}
                    onChange={e => setNewLesson({ ...newLesson, lesson_type: e.target.value })}
                    className="border rounded p-2"
                  >
                    <option value="video">Video</option>
                    <option value="text">Text</option>
                    <option value="quiz">Quiz</option>
                    <option value="assignment">Assignment</option>
                    <option value="file">File</option>
                  </select>
                  <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">Add Lesson</button>
                </form>
                {/* Lessons List */}
                {modules.map(mod => (
                  <div key={mod.id} className="mb-4">
                    <h4 className="font-semibold mb-2">Module: {mod.title}</h4>
                    <ul className="space-y-2">
                      {lessons.filter(l => l.module === mod.id).length === 0 && (
                        <li className="text-gray-400 italic">No lessons in this module.</li>
                      )}
                      {lessons.filter(l => l.module === mod.id).map(lesson => (
                        <li key={lesson.id} className="bg-gray-50 rounded p-2 flex flex-col md:flex-row md:items-center md:justify-between">
                          {editingLesson && editingLesson.id === lesson.id ? (
                            <form onSubmit={handleUpdateLesson} className="flex flex-col md:flex-row gap-2 w-full">
                              <input
                                type="text"
                                value={editingLesson.title}
                                onChange={e => setEditingLesson({ ...editingLesson, title: e.target.value })}
                                className="border rounded p-2 flex-1"
                                required
                              />
                              <input
                                type="text"
                                value={editingLesson.content}
                                onChange={e => setEditingLesson({ ...editingLesson, content: e.target.value })}
                                className="border rounded p-2 flex-1"
                              />
                              <select
                                value={editingLesson.lesson_type}
                                onChange={e => setEditingLesson({ ...editingLesson, lesson_type: e.target.value })}
                                className="border rounded p-2"
                              >
                                <option value="video">Video</option>
                                <option value="text">Text</option>
                                <option value="quiz">Quiz</option>
                                <option value="assignment">Assignment</option>
                                <option value="file">File</option>
                              </select>
                              <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Save</button>
                              <button type="button" onClick={() => setEditingLesson(null)} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">Cancel</button>
                            </form>
                          ) : (
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
                              <div className="flex-1">
                                <div className="font-bold">{lesson.title}</div>
                                <div className="text-gray-600 text-sm">{lesson.content?.slice(0, 60)}...</div>
                                <div className="text-xs text-gray-400">Type: {lesson.lesson_type}</div>
                              </div>
                              <div className="flex space-x-2 mt-2 md:mt-0">
                                <button onClick={() => handleEditLesson(lesson)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Edit</button>
                                <button onClick={() => handleDeleteLesson(lesson.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </>
            )}
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 