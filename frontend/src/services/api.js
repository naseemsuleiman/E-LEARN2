// src/services/api.js
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access') || localStorage.getItem('token') || localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const fetchCourses = () => api.get('/courses/').then(res => res.data);

export const createCourse = (courseData, isFormData = false) =>
  api.post('/courses/', courseData, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  }).then(res => res.data);

export const enrollInCourse = (courseId) =>
  api.post(`/enroll/${courseId}/`, { payment_status: 'paid' }).then(res => res.data);

// ---- INSTRUCTOR ----

export const fetchInstructorCourses = () => api.get('/instructor/dashboard/').then(res => res.data);

export const fetchInstructorStats = () => api.get('/instructor/stats/').then(res => res.data);

export const fetchInstructorMessages = () => api.get('/instructor/messages/').then(res => res.data);


export const fetchDashboardData = async () => {
  try {
    const [courses, stats, messages] = await Promise.all([
      fetchInstructorCourses(),
      fetchInstructorStats(),
      fetchInstructorMessages(),
    ]);
    return { courses, stats, messages };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

export const postNotification = (courseId, message) =>
  api.post('/notifications/create/', { course_id: courseId, message }).then(res => res.data);

export const updateCourse = (courseId, data) =>
  api.put(`/courses/${courseId}/`, data).then(res => res.data);

export const deleteCourse = (courseId) =>
  api.delete(`/courses/${courseId}/`).then(res => res.data);

export default api;
