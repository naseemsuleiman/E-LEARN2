import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

export const fetchCourses = async () => {
  const response = await axios.get(`${API_BASE}/courses/`);
  return response.data;
};

export const createCourse = async (courseData) => {
  const response = await axios.post(`${API_BASE}/courses/`, courseData, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  return response.data;
};

export const enrollInCourse = async (courseId) => {
  const response = await axios.post(`${API_BASE}/courses/${courseId}/enroll/`, {}, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  return response.data;
};

export const fetchInstructorCourses = async () => {
  const token = localStorage.getItem('token'); // Ensure the token is stored in localStorage
  const response = await axios.get(`${API_BASE}/instructor/dashboard/`, {
    headers: {
      Authorization: `Bearer ${token}`, // Add the token to the Authorization header
    },
  });
  return response.data;
};

const fetchDashboardData = async () => {
    try {
        const token = localStorage.getItem('accessToken'); 
        const response = await axios.get('http://localhost:8000/api/instructor/dashboard/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard:', error.message);
        throw error;
    }
};
