import React, { useState, useEffect } from 'react';
import { fetchCourses, createCourse, enrollInCourse } from '../services/api';
import { checkEnrollment } from '../services/lms';
import { useAuth } from '../context/AuthContext';

function Courses() {
  const { user } = useAuth();
  const userRole = user?.role;
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', thumbnail: null });
  const [enrolled, setEnrolled] = useState({});
  const [showPayment, setShowPayment] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      const data = await fetchCourses();
      setCourses(data);
      setLoading(false);
      if (userRole === 'student') {
        const enrollments = {};
        await Promise.all(
          data.map(async (course) => {
            const res = await checkEnrollment(course.id);
            enrollments[course.id] = !!res && !res.error;
          })
        );
        setEnrolled(enrollments);
      }
    };
    loadCourses();
  }, [userRole]);

  const handleCreateCourse = async () => {
    const formData = new FormData();
    formData.append('title', newCourse.title);
    formData.append('description', newCourse.description);
    if (newCourse.thumbnail) {
      formData.append('thumbnail', newCourse.thumbnail);
    }
    const createdCourse = await createCourse(formData, true);
    setCourses([...courses, createdCourse]);
  };

  const handleEnroll = (courseId) => {
    setSelectedCourse(courseId);
    setShowPayment(true);
  };

  const handlePayment = async () => {
    if (!selectedCourse) return;
    await enrollInCourse(selectedCourse);
    setEnrolled({ ...enrolled, [selectedCourse]: true });
    setShowPayment(false);
    setSelectedCourse(null);
    window.showToast && window.showToast('Enrolled successfully!', 'success');
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-purple-100 via-white to-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-purple-800 mb-8 text-center drop-shadow">All Courses</h1>
      {userRole === 'instructor' && (
        <div className="mb-8 bg-white rounded-lg shadow p-6 border-l-8 border-purple-300">
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">Create a New Course</h2>
          <input
            type="text"
            placeholder="Title"
            value={newCourse.title}
            onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
            className="block w-full mb-2 p-2 border rounded"
          />
          <textarea
            placeholder="Description"
            value={newCourse.description}
            onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
            className="block w-full mb-2 p-2 border rounded"
          />
          <input
            type="file"
            accept="image/*"
            onChange={e => setNewCourse({ ...newCourse, thumbnail: e.target.files[0] })}
            className="block w-full mb-2 p-2 border rounded"
          />
          <button onClick={handleCreateCourse} className="bg-purple-600 text-white px-6 py-2 rounded shadow hover:bg-purple-700 transition">Create Course</button>
        </div>
      )}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Course Payment</h2>
            <p className="mb-4">This is a mock payment modal. Click below to simulate payment and enroll.</p>
            <button onClick={handlePayment} className="bg-purple-600 text-white px-6 py-2 rounded shadow hover:bg-purple-700 transition w-full mb-2">Pay & Enroll</button>
            <button onClick={() => setShowPayment(false)} className="w-full text-gray-500 mt-2">Cancel</button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl shadow-lg border border-purple-100 flex flex-col items-center hover:scale-105 transition-transform overflow-hidden">
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
              {course.thumbnail ? (
                <img src={`http://localhost:8000${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400">No Image</span>
              )}
            </div>
            <div className="p-4 w-full flex-1 flex flex-col justify-between">
              <div>
                <div className="font-bold text-lg mb-1 text-purple-800 text-center">{course.title}</div>
                <div className="text-gray-700 mb-2 text-center">{course.description}</div>
              </div>
              <div className="flex flex-col items-center mt-2">
                {userRole === 'student' && (
                  enrolled[course.id] ? (
                    <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded mt-2">Enrolled</span>
                  ) : (
                    <button onClick={() => handleEnroll(course.id)} className="bg-purple-600 text-white px-4 py-2 rounded mt-2">Enroll</button>
                  )
                )}
                {userRole === 'instructor' && (
                  <span className="inline-block bg-purple-50 text-purple-700 px-3 py-1 rounded mt-2">Course ID: {course.id}</span>
                )}
                <a href={`/courses/${course.id}`} className="text-purple-600 hover:underline font-semibold mt-2">Go to Course</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Courses;
