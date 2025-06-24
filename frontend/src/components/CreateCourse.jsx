import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

// Accept setCourses and courses as props!
export default function CreateCourse({ setActiveTab, setCourses, courses }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const [lessons, setLessons] = useState([]);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonVideo, setLessonVideo] = useState('');

  const uploadThumbnail = async () => {
    if (!thumbnailFile) return '';
    setUploading(true);
    const data = new FormData();
    data.append('file', thumbnailFile);
    data.append('upload_preset', 'online-learning');
    data.append('cloud_name', 'dmi53zthk');

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/dmi53zthk/image/upload`, {
        method: 'POST',
        body: data,
      });
      const result = await res.json();
      setThumbnailUrl(result.secure_url);
      toast.success('✅ Thumbnail uploaded to Cloudinary!');
      return result.secure_url;
    } catch (err) {
      console.error(err);
      toast.error('❌ Cloudinary upload failed');
      return '';
    } finally {
      setUploading(false);
    }
  };

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
    if (!title || !description) {
      toast.error('Fill in all required fields.');
      return;
    }

    let cloudUrl = thumbnailUrl;
    if (thumbnailFile && !cloudUrl) {
      cloudUrl = await uploadThumbnail();
    }

    try {
      const payload = {
        title,
        description,
        thumbnail_url: cloudUrl || '',
        lessons,
      };
      const res = await api.post('/courses/', payload);
      const newCourse = res.data;
      toast.success('🎉 Course created!');
      // Use the parent setCourses to update the dashboard!
      setCourses(prev => [...(Array.isArray(prev) ? prev : []), newCourse]);
      setActiveTab('overview');
    } catch (err) {
      console.error(err);
      toast.error('❌ Failed to create course.');
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
          <label className="block mb-2 font-semibold">Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border rounded-lg"
            required
          />
        </div>

        {/* Cloudinary Thumbnail */}
        <div>
          <label className="block mb-2 font-semibold">Thumbnail</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              setThumbnailFile(e.target.files[0]);
              setThumbnailUrl('');
            }}
            className="w-full px-4 py-2 border rounded-lg"
          />
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
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
