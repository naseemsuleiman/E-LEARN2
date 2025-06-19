import {  Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Home from './pages/Home';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import Register from './components/Register';
import AdminDashboard from './pages/AdminDashboard';
import InstructorDashboard from './pages/Dashboard2';

function App() {
  return (
  <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
       <Route path="/dashboard" element={<Dashboard />} />
       <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/dashboard2" element={<InstructorDashboard />} />
      </Routes>
      </>
  );
}

export default App;
