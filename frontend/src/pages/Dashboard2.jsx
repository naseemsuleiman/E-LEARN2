import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCourse, setNewCourse] = useState({ title: '', description: '' });
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get the token from localStorage
        const token = localStorage.getItem('access');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(
          'http://localhost:8000/api/instructor/dashboard/', 
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.response?.data?.detail || error.message);
        
        // If token is invalid, log the user out
        if (error.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [logout]);

  const handleCreateCourse = async () => {
    try {
      const token = localStorage.getItem('access');
      const response = await axios.post(
        'http://localhost:8000/api/courses/',
        newCourse,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setCourses([...courses, response.data]);
      setNewCourse({ title: '', description: '' });
    } catch (error) {
      console.error('Error creating course:', error);
      setError(error.response?.data?.detail || error.message);
    }
  };

  if (loading) return <div className="p-4">Loading dashboard...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Instructor Dashboard</h1>
      
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Create a New Course</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Course Title"
            className="w-full p-2 border rounded"
            value={newCourse.title}
            onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
          />
          <textarea
            placeholder="Course Description"
            className="w-full p-2 border rounded"
            rows={4}
            value={newCourse.description}
            onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
          />
          <button 
            onClick={handleCreateCourse}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Course
          </button>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Your Courses</h2>
      {courses.length === 0 ? (
        <p>No courses found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow p-4 border">
              <h3 className="font-bold text-lg">{course.title}</h3>
              <p className="text-gray-600 mt-2">{course.description}</p>
              <div className="mt-4 space-x-2">
                <button className="text-blue-600 hover:text-blue-800">Edit</button>
                <button className="text-red-600 hover:text-red-800">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default InstructorDashboard;