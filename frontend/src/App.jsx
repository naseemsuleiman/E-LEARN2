// App.jsx
import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Home from './pages/Home';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import Register from './components/Register';
import AdminDashboard from './pages/AdminDashboard';
import InstructorDashboard from './pages/Dashboard2';
import PrivateRoute from './components/PrivateRoute';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import GradebookPage from './pages/GradebookPage';
import NotificationList from './components/NotificationList';
import Profile from './pages/Profile';
import Toast from './components/Toast';
import ManageCourse from './pages/ManageCourse';

function App() {
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 2500);
  };

  useEffect(() => {
    window.showToast = (message, type = 'success') => {
      setToast({ message, type });
      setTimeout(() => setToast({ message: '', type: 'success' }), 2500);
    };
    return () => { window.showToast = undefined; };
  }, []);

  return (
    <>
      <Navbar />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:courseId" element={<CourseDetail />} />
        <Route path="/gradebook" element={<GradebookPage />} />
        <Route path="/notifications" element={<NotificationList />} />
        <Route path="/profile" element={<Profile />} />
        
        <Route element={<PrivateRoute roles={['student']} />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        
        <Route element={<PrivateRoute roles={['instructor']} />}>
          <Route path="/dashboard2" element={<InstructorDashboard />} />
          <Route path="/courses/:courseId/manage" element={<ManageCourse />} />
        </Route>
        
        <Route element={<PrivateRoute roles={['admin']} />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;