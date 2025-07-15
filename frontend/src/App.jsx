// App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";
import Navbar from "./Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import CourseCreate from "./pages/CourseCreate";
import CourseEdit from "./pages/CourseEdit";
import Profile from "./pages/Profile";
import MyCourses from "./pages/MyCourses";
import CoursePlayer from "./pages/CoursePlayer";
import Quiz from "./pages/Quiz";
import Assignments from "./pages/Assignments";
import Discussion from "./pages/Discussion";
import Certificates from "./pages/Certificates";
import Wishlist from "./pages/Wishlist";
import LearningPaths from "./pages/LearningPaths";
import NotFound from "./pages/NotFound";
import CourseLessons from './pages/CourseLessons';
import GradebookPage from './pages/GradebookPage';
import InstructorCourses from "./pages/InstructorCourses";
import "./App.css";


// Lazy load components for better performance
const LazyHome = React.lazy(() => import('./pages/Home'));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <div className="App flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
              <React.Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <LoadingSpinner size="xl" text="Loading..." />
                </div>
              }>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LazyHome />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/courses/:id" element={<CourseDetail />} />
                  {/* Instructor Courses Management */}
                  <Route path="/instructor-courses" element={<InstructorCourses />} />
                  
                  {/* Protected Routes - Student */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/my-courses" element={<MyCourses />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/certificates" element={<Certificates />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/learning-paths" element={<LearningPaths />} />
                  <Route path="/gradebook" element={<GradebookPage />} />
                  
                  {/* Protected Routes - Instructor */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/courses/create" element={<CourseCreate />} />
                  <Route path="/courses/:id/edit" element={<CourseEdit />} />
                  <Route path="/courses/:id/assignments" element={<Assignments />} />
                  

                  <Route path="/courses/:id/discussion" element={<Discussion />} />
                  
                  {/* Protected Routes - Learning */}
                  <Route path="/courses/:id/learn" element={<CoursePlayer />} />
                  <Route path="/courses/:id/quiz/:quizId" element={<Quiz />} />
                  <Route path="/courses/:id/lessons-all" element={<CourseLessons />} />
                  
                  {/* Protected Routes - Admin */}
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  
                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </React.Suspense>
            </main>
            <footer className="bg-emerald-700 text-white text-center py-4 mt-8 border-t border-emerald-800">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-4">
                <div className="flex items-center space-x-2 mb-2 md:mb-0">
                  <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="font-bold">E-Learn Platform</span>
                </div>
                <div className="text-sm">&copy; {new Date().getFullYear()} E-Learn. All rights reserved.</div>
                <div className="flex space-x-4 mt-2 md:mt-0">
                  <a href="/about" className="hover:underline">About</a>
                  <a href="/contact" className="hover:underline">Contact</a>
                  <a href="/privacy" className="hover:underline">Privacy</a>
                </div>
              </div>
            </footer>
          </div>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;