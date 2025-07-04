import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function CourseLessons() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [modulesRes, lessonsRes] = await Promise.all([
        api.get(`/api/modules/?course=${id}`),
        api.get(`/api/courses/${id}/lessons/`)
      ]);
      setModules(modulesRes.data);
      setLessons(lessonsRes.data);
    } catch (e) {
      setModules([]);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading lessons...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate(`/courses/${id}`)}
          className="mb-6 text-purple-600 hover:underline"
        >
          &larr; Back to Course
        </button>
        <h1 className="text-3xl font-bold mb-6 text-gray-900">All Lessons</h1>
        {modules.length > 0 ? (
          <div className="space-y-8">
            {modules.map((mod) => (
              <div key={mod.id} className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-purple-700 mb-2">{mod.title}</h2>
                {mod.description && <div className="text-gray-600 mb-4">{mod.description}</div>}
                <div className="space-y-2">
                  {lessons.filter(l => l.module === mod.id).length === 0 && (
                    <div className="text-gray-400 italic">No lessons in this module.</div>
                  )}
                  {lessons.filter(l => l.module === mod.id).map((lesson, idx) => (
                    <div
                      key={lesson.id}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/courses/${id}/learn?lesson=${lesson.id}`)}
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full mr-4">
                        <span className="text-sm font-medium text-purple-600">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                        <p className="text-sm text-gray-500">{lesson.description}</p>
                      </div>
                      <ArrowRightIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, idx) => (
              <div
                key={lesson.id}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/courses/${id}/learn?lesson=${lesson.id}`)}
              >
                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full mr-4">
                  <span className="text-sm font-medium text-purple-600">{idx + 1}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                  <p className="text-sm text-gray-500">{lesson.description}</p>
                </div>
                <ArrowRightIcon className="h-5 w-5 text-gray-400" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 