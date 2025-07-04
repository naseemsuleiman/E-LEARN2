// Navbar.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UserCircleIcon, ChevronDownIcon, ArrowRightOnRectangleIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useAuth } from "./context/AuthContext";

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Helper to highlight active link
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-emerald-700 to-emerald-500 shadow-lg border-b border-emerald-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center text-white font-bold text-xl hover:text-emerald-100 transition-colors duration-200">
              <svg className="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              E-Learn
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Link to={user?.role === 'student' ? '/dashboard' : user?.role === 'instructor' ? '/dashboard2' : '/admin-dashboard'}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive(user?.role === 'student' ? '/dashboard' : user?.role === 'instructor' ? '/dashboard2' : '/admin-dashboard') ? 'bg-emerald-700 text-white' : 'text-emerald-100 hover:text-white'}`}
                >
                  Dashboard
                </Link>
                <Link to="/courses" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/courses') ? 'bg-emerald-700 text-white' : 'text-emerald-100 hover:text-white'}`}>Courses</Link>
                <Link to="/gradebook" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/gradebook') ? 'bg-emerald-700 text-white' : 'text-emerald-100 hover:text-white'}`}>Gradebook</Link>
                <Link to="/notifications" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/notifications') ? 'bg-emerald-700 text-white' : 'text-emerald-100 hover:text-white'}`}>Notifications</Link>
                <Link to="/messages" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/messages') ? 'bg-emerald-700 text-white' : 'text-emerald-100 hover:text-white'}`}>Messages</Link>
                <Link to="/profile" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/profile') ? 'bg-emerald-700 text-white' : 'text-emerald-100 hover:text-white'}`}>Profile</Link>
                {/* User Dropdown */}
                <div className="relative">
                  <button onClick={() => setMenuOpen(v => !v)} className="flex items-center text-white focus:outline-none">
                    <UserCircleIcon className="h-6 w-6 mr-1" />
                    <span className="mr-1">{user?.username} ({user?.role})</span>
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-50 border border-emerald-100">
                      <Link to="/profile" className="flex items-center px-4 py-2 text-gray-700 hover:bg-emerald-50" onClick={() => setMenuOpen(false)}><UserCircleIcon className="h-5 w-5 mr-2" />Profile</Link>
                      <Link to="/settings" className="flex items-center px-4 py-2 text-gray-700 hover:bg-emerald-50" onClick={() => setMenuOpen(false)}><Cog6ToothIcon className="h-5 w-5 mr-2" />Settings</Link>
                      <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-emerald-50"><ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />Logout</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-emerald-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Login</Link>
                <Link to="/register" className="bg-white text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile Nav Toggle */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileOpen(v => !v)} className="text-white focus:outline-none">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-emerald-700 px-4 py-3 space-y-2">
          {isLoggedIn ? (
            <>
              <Link to={user?.role === 'student' ? '/dashboard' : user?.role === 'instructor' ? '/dashboard2' : '/admin-dashboard'} className="block text-white py-2" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <Link to="/courses" className="block text-white py-2" onClick={() => setMobileOpen(false)}>Courses</Link>
              <Link to="/gradebook" className="block text-white py-2" onClick={() => setMobileOpen(false)}>Gradebook</Link>
              <Link to="/notifications" className="block text-white py-2" onClick={() => setMobileOpen(false)}>Notifications</Link>
              <Link to="/messages" className="block text-white py-2" onClick={() => setMobileOpen(false)}>Messages</Link>
              <Link to="/profile" className="block text-white py-2" onClick={() => setMobileOpen(false)}>Profile</Link>
              <button onClick={handleLogout} className="block text-white py-2 w-full text-left">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-white py-2" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" className="block text-white py-2" onClick={() => setMobileOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}