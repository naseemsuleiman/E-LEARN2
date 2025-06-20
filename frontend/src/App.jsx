// App.jsx
import { Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Home from './pages/Home';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import Register from './components/Register';
import AdminDashboard from './pages/AdminDashboard';
import InstructorDashboard from './pages/Dashboard2';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<PrivateRoute roles={['student']} />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        
        <Route element={<PrivateRoute roles={['instructor']} />}>
          <Route path="/dashboard2" element={<InstructorDashboard />} />
        </Route>
        
        <Route element={<PrivateRoute roles={['admin']} />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;