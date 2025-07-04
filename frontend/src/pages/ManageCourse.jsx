import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService, { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ManageCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [paymentInfo, setPaymentInfo] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/courses/${courseId}/`);
        setCourse(res.data);
        setForm({ title: res.data.title, description: res.data.description });
        // Fetch enrolled students
        const studentsRes = await api.get(`/api/courses/${courseId}/students/`);
        setStudents(studentsRes.data);
      } catch {
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleEdit = async () => {
    try {
      await apiService.updateCourse(courseId, form);
      setEditMode(false);
      window.showToast && window.showToast('Course updated!', 'success');
    } catch {
      window.showToast && window.showToast('Failed to update course.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await apiService.deleteCourse(courseId);
      window.showToast && window.showToast('Course deleted!', 'success');
      navigate('/courses');
    } catch {
      window.showToast && window.showToast('Failed to delete course.', 'error');
    }
  };

  const handleUnenroll = async (studentId) => {
    if (!window.confirm('Remove this student from the course?')) return;
    try {
      await api.delete(`/api/enroll/${courseId}/${studentId}/`);
      setStudents(students.filter(s => s.id !== studentId));
      window.showToast && window.showToast('Student removed.', 'success');
    } catch {
      window.showToast && window.showToast('Failed to remove student.', 'error');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!course) return <div>Course not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-4">Manage Course: {course.title}</h1>
      {editMode ? (
        <div className="mb-4">
          <input
            type="text"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="block w-full mb-2 p-2 border rounded"
            placeholder="Course Title"
          />
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="block w-full mb-2 p-2 border rounded"
            placeholder="Course Description"
          />
          <button onClick={handleEdit} className="bg-purple-600 text-white px-4 py-2 rounded mr-2">Save</button>
          <button onClick={() => setEditMode(false)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
        </div>
      ) : (
        <div className="mb-4">
          <div className="font-bold">Title:</div>
          <div className="mb-2">{course.title}</div>
          <div className="font-bold">Description:</div>
          <div className="mb-2">{course.description}</div>
          <button onClick={() => setEditMode(true)} className="bg-purple-600 text-white px-4 py-2 rounded">Edit Course</button>
        </div>
      )}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Payment Info</h2>
        <input
          type="text"
          value={paymentInfo}
          onChange={e => setPaymentInfo(e.target.value)}
          className="block w-full mb-2 p-2 border rounded"
          placeholder="Payment details (for demo)"
        />
        <div className="text-xs text-gray-500">(This is a placeholder. Integrate real payment as needed.)</div>
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Enrolled Students</h2>
        <ul>
          {students.length === 0 && <li>No students enrolled.</li>}
          {students.map(student => (
            <li key={student.id} className="flex items-center justify-between border-b py-2">
              <span>{student.username} ({student.email})</span>
              <button onClick={() => handleUnenroll(student.id)} className="bg-red-500 text-white px-3 py-1 rounded">Remove</button>
            </li>
          ))}
        </ul>
      </div>
      <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">Delete Course</button>
    </div>
  );
};

export default ManageCourse;
