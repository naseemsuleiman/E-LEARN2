import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export default function InstructorCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line
  }, [user]);

  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const allCourses = await apiService.getCourses();
      const instructorCourses = allCourses.filter(
        (course) => course.instructor === user?.id || course.instructor?.id === user?.id
      );
      setCourses(instructorCourses);
    } catch (err) {
      setError('Failed to fetch courses.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await apiService.deleteCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert('Failed to delete course.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Courses I Teach</h1>
          <Link
            to="/dashboard?tab=create"
            className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors"
          >
            + Create New Course
          </Link>
        </div>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">You haven't created any courses yet.</h3>
            <p className="text-gray-600 mb-6">Start sharing your knowledge by creating a course.</p>
            <Link
              to="/dashboard?tab=create"
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            >
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <img
                  src={course.thumbnail || 'https://via.placeholder.com/300x200?text=Course+Image'}
                  alt={course.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    <Link to={`/courses/${course.id}`} className="hover:text-emerald-600">
                      {course.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{course.short_description || course.description}</p>
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => navigate(`/courses/${course.id}/edit`)}
                      className="flex-1 bg-emerald-500 text-white py-2 px-4 rounded-md text-center hover:bg-emerald-600 active:bg-emerald-700 transition-colors text-sm font-medium shadow-sm"
                      style={{ boxShadow: '0 2px 8px 0 rgba(16, 185, 129, 0.10)' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      disabled={deletingId === course.id}
                      className={`flex-1 bg-green-700 text-white py-2 px-4 rounded-md text-center hover:bg-green-800 active:bg-green-900 transition-colors text-sm font-medium shadow-sm disabled:opacity-50 ${deletingId === course.id ? 'cursor-not-allowed' : ''}`}
                      style={{ boxShadow: '0 2px 8px 0 rgba(21, 128, 61, 0.10)' }}
                    >
                      {deletingId === course.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                  <Link
                    to={`/manage-course/${course.id}`}
                    className="block mt-3 text-emerald-700 hover:underline text-xs text-center"
                  >
                    Manage Students & More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 