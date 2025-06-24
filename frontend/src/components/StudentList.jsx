import React, { useEffect, useState } from 'react';
import api from '../services/api';

const StudentList = ({ courseId }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get(`/courses/${courseId}/students/`);
        setStudents(res.data);
      } catch (e) {
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [courseId]);

  if (loading) return <div>Loading students...</div>;
  if (!students.length) return <div>No students enrolled yet.</div>;

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Enrolled Students</h2>
      <ul className="space-y-2">
        {students.map((s) => (
          <li key={s.id} className="bg-green-50 rounded p-2">
            <div className="font-bold">{s.username}</div>
            <div className="text-gray-600">{s.email}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentList;
