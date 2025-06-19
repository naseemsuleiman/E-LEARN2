import React, { useState, useEffect } from 'react';
import { fetchCourses, createCourse, enrollInCourse } from '../api';

function Courses({ userRole }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCourse, setNewCourse] = useState({ title: '', description: '' });

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      const data = await fetchCourses();
      setCourses(data);
      setLoading(false);
    };
    loadCourses();
  }, []);

  const handleCreateCourse = async () => {
    const createdCourse = await createCourse(newCourse);
    setCourses([...courses, createdCourse]);
  };

  const handleEnroll = async (courseId) => {
    await enrollInCourse(courseId);
    alert('Enrolled successfully!');
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {userRole === 'teacher' && (
        <div>
          <h2>Create a New Course</h2>
          <input
            type="text"
            placeholder="Title"
            value={newCourse.title}
            onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
          />
          <textarea
            placeholder="Description"
            value={newCourse.description}
            onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
          />
          <button onClick={handleCreateCourse}>Create Course</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow p-4 border">
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            {userRole === 'student' && (
              <button onClick={() => handleEnroll(course.id)}>Enroll</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Courses;
