import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

// Accept setCourses and courses as props!
export default function CreateCourse({ setActiveTab, setCourses, courses }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [price, setPrice] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');

  const [lessons, setLessons] = useState([]);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonVideo, setLessonVideo] = useState('');

  const addLesson = () => {
    if (!lessonTitle || !lessonContent) {
      toast.error('Lesson title & content are required.');
      return;
    }
    setLessons((prev) => [
      ...prev,
      { title: lessonTitle, content: lessonContent, video: lessonVideo },
    ]);
    setLessonTitle('');
    setLessonContent('');
    setLessonVideo('');
  };

  const removeLesson = (index) => {
    setLessons((prev) => prev.filter((_, i) => i !== index));
  };

 const submitCourse = async (e) => {
  e.preventDefault();

  if (!title || !description || !shortDescription || !price || !difficulty) {
    toast.error('Fill in all required fields.');
    return;
  }

  setUploading(true);

  try {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('short_description', shortDescription);
    formData.append('price', price);
    formData.append('difficulty', difficulty);
    if (thumbnail) formData.append('thumbnail', thumbnail);

    // 📦 Construct modules and lessons in the expected structure
    const modules = [
      {
        title: "Introduction",
        description: "Auto-created module",
        order: 1,
        lessons: lessons.map((lesson, index) => ({
          title: lesson.title,
          content: lesson.content,
          video_url: lesson.video || '',
          order: index + 1,
          lesson_type: 'video', // or text, quiz — match your model
          duration: 0 // optional: set if needed
        })),
      },
    ];

    // 🚀 Send modules as stringified JSON
    formData.append('modules', JSON.stringify(modules));

    // 🛰 Send to backend
    const res = await apiService.createCourse(formData);
    const newCourse = res.data;

    setCourses((prev) => [...(Array.isArray(prev) ? prev : []), newCourse]);
    toast.success('🎉 Course and lessons created!');
    setActiveTab('overview');
  } catch (err) {
    console.error('Backend error:', err.response?.data || err.message);
    toast.error('❌ Failed to create course');
  } finally {
    setUploading(false);
  }
};


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-10 rounded-2xl shadow-xl max-w-3xl mx-auto border border-gray-100"
    >
      <h2 className="text-3xl font-extrabold mb-6 text-blue-700">Create a New Course</h2>
      <form onSubmit={submitCourse} className="space-y-6">
        {/* Course Info */}
        <div>
          <label className="block mb-2 font-semibold">Course Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Short Description *</label>
          <input
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
            maxLength={200}
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Price *</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={e => setPrice(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Difficulty *</label>
          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
            required
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Django Thumbnail Upload */}
        <div>
          <label className="block mb-2 font-semibold">Thumbnail</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setThumbnail(e.target.files[0])}
            className="w-full px-4 py-2 border rounded-lg"
          />
          {thumbnail && (
            <img
              src={URL.createObjectURL(thumbnail)}
              alt="Thumbnail Preview"
              className="mt-4 max-h-60 rounded border shadow"
            />
          )}
        </div>

        {/* Lessons */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="font-bold mb-3 text-blue-600">📚 Lessons</h3>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <input
              placeholder="Lesson Title"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              className="px-4 py-2 border rounded"
            />
            <input
              placeholder="Lesson Content"
              value={lessonContent}
              onChange={(e) => setLessonContent(e.target.value)}
              className="px-4 py-2 border rounded"
            />
            <input
              placeholder="Optional Video URL"
              value={lessonVideo}
              onChange={(e) => setLessonVideo(e.target.value)}
              className="px-4 py-2 border rounded"
            />
          </div>
          <button
            type="button"
            onClick={addLesson}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Add Lesson
          </button>
          {lessons.length > 0 && (
            <ul className="mt-4 space-y-2">
              {lessons.map((lesson, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center bg-white border rounded px-4 py-2 shadow-sm"
                >
                  <span>
                    {lesson.title} — {lesson.content}
                  </span>
                  <button
                    onClick={() => removeLesson(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : ' Create Course with Lessons'}
        </button>
      </form>
    </motion.div>
  );
}
