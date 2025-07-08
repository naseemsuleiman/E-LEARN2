import api from '../services/api';

export const fetchModules = (courseId) => api.get(`/api/modules/?course=${courseId}`).then(res => res.data);
export const fetchLessons = (moduleId) => api.get(`/api/lessons/?module=${moduleId}`).then(res => res.data);

export const fetchAssignments = (courseId) => api.get(`/api/assignments/?course=${courseId}`).then(res => res.data);
export const fetchAnnouncements = (courseId) => api.get(`/api/announcements/?course=${courseId}`).then(res => res.data);
export const fetchStudents = (courseId) => api.get(`/api/courses/${courseId}/students/`).then(res => res.data);
export const fetchNotifications = () => api.get('/api/notifications/').then(res => res.data);
export const fetchGradebook = () => api.get('/api/gradebook/').then(res => res.data);
export const checkEnrollment = (courseId) => api.get(`/api/enroll/${courseId}/`).then(res => res.data).catch(() => null);
export const unenrollFromCourse = (courseId) => api.delete(`/api/enroll/${courseId}/`).then(res => res.data);
export const generateQuiz = (heading, content) =>
  api.post('/api/generate-quiz/', { heading, content });

// Lesson Progress
export const getLessonProgress = (lessonId) => api.get(`/api/lessons/${lessonId}/progress/`).then(res => res.data);
export const setLessonProgress = (lessonId, data = { is_completed: true }) => api.post(`/api/lessons/${lessonId}/progress/`, data).then(res => res.data);

// Course Progress
export const getCourseProgress = (courseId) => api.get(`/api/courses/${courseId}/progress/`).then(res => res.data);
export const getAllProgress = () => api.get('/api/progress/').then(res => res.data);
export const markProgress = (lessonId, courseId) => api.post('/api/progress/mark/', { lesson_id: lessonId, course_id: courseId }).then(res => res.data);
