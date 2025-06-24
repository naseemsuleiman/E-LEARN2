import React, { useEffect, useState } from 'react';
import api from '../services/api';

const GradebookPage = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await api.get('/gradebook/');
        setGrades(res.data);
      } catch (e) {
        setGrades([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, []);

  if (loading) return <div>Loading gradebook...</div>;
  if (!grades.length) return <div>No grades yet.</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gradebook</h1>
      <table className="min-w-full bg-white border rounded">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Course</th>
            <th className="py-2 px-4 border-b">Assignment</th>
            <th className="py-2 px-4 border-b">Grade</th>
            <th className="py-2 px-4 border-b">Feedback</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((g) => (
            <tr key={g.id}>
              <td className="py-2 px-4 border-b">{g.course}</td>
              <td className="py-2 px-4 border-b">{g.assignment}</td>
              <td className="py-2 px-4 border-b">{g.grade}</td>
              <td className="py-2 px-4 border-b">{g.feedback}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GradebookPage;
