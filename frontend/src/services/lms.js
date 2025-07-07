import api from '../services/api';

export const fetchModules = (courseId) => api.get(`/api/modules/?course=${courseId}`).then(res => res.data);
export const fetchLessons = (moduleId) => api.get(`/api/lessons/?module=${moduleId}`).then(res => res.data);

export const fetchAssignments = (courseId) => api.get(`/assignments/?course=${courseId}`).then(res => res.data);
export const fetchAnnouncements = (courseId) => api.get(`/announcements/?course=${courseId}`).then(res => res.data);
export const fetchStudents = (courseId) => api.get(`/courses/${courseId}/students/`).then(res => res.data);
export const fetchNotifications = () => api.get('/notifications/').then(res => res.data);
export const fetchGradebook = () => api.get('/gradebook/').then(res => res.data);
export const checkEnrollment = (courseId) => api.get(`/enroll/${courseId}/`).then(res => res.data).catch(() => null);
export const unenrollFromCourse = (courseId) => api.delete(`/enroll/${courseId}/`).then(res => res.data);
export const generateQuiz = (heading, content) =>
  api.post('/generate-quiz/', { heading, content });
