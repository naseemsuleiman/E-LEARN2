// src/services/api.js
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
            refresh: refreshToken
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          console.error('Bad Request:', data);
          break;
        case 403:
          console.error('Forbidden:', data);
          break;
        case 404:
          console.error('Not Found:', data);
          break;
        case 500:
          console.error('Server Error:', data);
          break;
        default:
          console.error(`HTTP ${status}:`, data);
      }
    } else if (error.request) {
      // Network error
      console.error('Network Error:', error.request);
    } else {
      // Other error
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Enhanced API methods with better error handling
export const apiService = {
  // Auth methods
  login: async (credentials) => {
    try {
      const response = await api.post('/api/login/', credentials);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/api/register/', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Course methods
  getCourses: async (params = {}) => {
    try {
      const response = await api.get('/api/courses/', { params });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch courses');
    }
  },

  getCourse: async (id) => {
    try {
      const response = await api.get(`/api/courses/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch course');
    }
  },

  createCourse: async (courseData) => {
    try {
      let dataToSend = courseData;
      // If courseData is not FormData, convert it (for file uploads)
      if (!(courseData instanceof FormData)) {
        dataToSend = new FormData();
        Object.entries(courseData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            dataToSend.append(key, value);
          }
        });
      }
      const response = await api.post('/api/courses/', dataToSend);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create course');
    }
  },

  updateCourse: async (id, courseData) => {
    try {
      let dataToSend = courseData;
      if (!(courseData instanceof FormData)) {
        dataToSend = new FormData();
        Object.entries(courseData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            dataToSend.append(key, value);
          }
        });
      }
      const response = await api.put(`/api/courses/${id}/`, dataToSend);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update course');
    }
  },

  deleteCourse: async (id) => {
    try {
      await api.delete(`/api/courses/${id}/`);
      return true;
    } catch (error) {
      throw new Error('Failed to delete course');
    }
  },

  // Enrollment methods
  enrollInCourse: async (courseId) => {
    try {
      const response = await api.post(`/api/courses/${courseId}/enroll/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to enroll in course');
    }
  },

  getEnrollments: async () => {
    try {
      const response = await api.get('/api/enrollments/');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch enrollments');
    }
  },

  // Profile methods
  getProfile: async () => {
    try {
      const response = await api.get('/api/profile/');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch profile');
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.patch('/api/profile/', profileData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  // Assignment methods
  getAssignments: async () => {
    try {
      const response = await api.get('/api/assignments/');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch assignments');
    }
  },

  submitAssignment: async (assignmentId, submissionData) => {
    try {
      const response = await api.post(`/api/assignments/${assignmentId}/submissions/`, submissionData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit assignment');
    }
  },

  // Quiz methods
  generateAIQuiz: async (courseId, courseData) => {
    try {
      const response = await api.post(`/api/courses/${courseId}/ai-quiz/`, courseData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to generate AI quiz');
    }
  },

  submitAIQuiz: async (courseId, quizData) => {
    try {
      const response = await api.post(`/api/courses/${courseId}/ai-quiz/submit/`, quizData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to submit AI quiz');
    }
  },

  // Wishlist methods
  addToWishlist: async (courseId) => {
    try {
      const response = await api.post('/api/wishlist/', { course: courseId });
      return response.data;
    } catch (error) {
      throw new Error('Failed to add to wishlist');
    }
  },

  removeFromWishlist: async (courseId) => {
    try {
      await api.delete(`/api/wishlist/${courseId}/`);
      return true;
    } catch (error) {
      throw new Error('Failed to remove from wishlist');
    }
  },

  getWishlist: async () => {
    try {
      const response = await api.get('/api/wishlist/');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch wishlist');
    }
  },

  // Discussion methods
  getDiscussions: async (courseId) => {
    try {
      const response = await api.get(`/api/courses/${courseId}/discussions/`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch discussions');
    }
  },

  createDiscussion: async (courseId, discussionData) => {
    try {
      const response = await api.post(`/api/courses/${courseId}/discussions/`, discussionData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create discussion');
    }
  },

  // Progress methods
  updateProgress: async (progressData) => {
    try {
      const response = await api.post('/api/progress/mark/', progressData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update progress');
    }
  },

  // Dashboard methods
  getStudentDashboard: async () => {
    try {
      const response = await api.get('/api/student/dashboard/');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch student dashboard');
    }
  },

  getInstructorDashboard: async () => {
    try {
      const response = await api.get('/api/instructor/dashboard/');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch instructor dashboard');
    }
  },


  

  // Utility method for file uploads
  uploadFile: async (file, onProgress) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/api/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });

      return response.data;
    } catch (error) {
      throw new Error('Failed to upload file');
    }
  },

  // Gemini AI Quiz Generation
  generateGeminiQuiz: async ({ heading, content }) => {
    try {
      const response = await api.post('/api/gemini-quiz/', { heading, content });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to generate AI quiz');
    }
  },

  isEnrolledInCourse: async (courseId) => {
    try {
      await api.get(`/api/courses/${courseId}/enroll/`);
      return true;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return false;
      }
      throw error;
    }
  },

  // Messaging
  getMessages: async () => {
    const response = await api.get('/api/messages/');
    return response.data;
  },
  getMessageThread: async (userId) => {
    const response = await api.get(`/api/messages/${userId}/`);
    return response.data;
  },
  sendMessage: async (userId, content) => {
    const response = await api.post(`/api/messages/${userId}/`, { content });
    return response.data;
  },
};

export { api };
export default apiService;
