import React, { useEffect, useState } from 'react';
import apiService, { api } from '../services/api';

const GradebookPage = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await api.get('/api/gradebook/');
        setGrades(res.data);
      } catch (e) {
        setGrades([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-emerald-700">Loading gradebook...</p>
      </div>
    </div>
  );
  
  if (!grades.length) return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-emerald-700 text-lg">No grades yet.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-emerald-700 mb-6">Gradebook</h1>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-emerald-100">
          <table className="min-w-full">
            <thead className="bg-emerald-50">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-emerald-700 border-b border-emerald-200">Course</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-emerald-700 border-b border-emerald-200">Assignment</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-emerald-700 border-b border-emerald-200">Grade</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-emerald-700 border-b border-emerald-200">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 border-b border-gray-100">{g.assignment?.course?.title || 'N/A'}</td>
                  <td className="py-3 px-4 border-b border-gray-100">{g.assignment?.title || 'N/A'}</td>
                  <td className="py-3 px-4 border-b border-gray-100 font-semibold text-emerald-700">{g.grade || 'Not graded'}</td>
                  <td className="py-3 px-4 border-b border-gray-100">{g.feedback || 'No feedback'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GradebookPage;
