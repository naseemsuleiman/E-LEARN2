import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { fetchInstructorCourses, createCourse } from '../api';

function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCourse, setNewCourse] = useState({ title: '', description: '' });

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      const data = await fetchInstructorCourses();
      setCourses(data);
      setLoading(false);
    };
    loadCourses();
  }, []);

  const handleCreateCourse = async () => {
    const createdCourse = await createCourse(newCourse);
    setCourses([...courses, createdCourse]);
  };

  const fetchDashboardData = async () => {
    try {

      const response = await axios.get('http://localhost:8000/api/instructor/dashboard/');
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Instructor Dashboard</h1>
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

      <h2>Your Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow p-4 border">
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <button>Edit</button>
            <button>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InstructorDashboard;