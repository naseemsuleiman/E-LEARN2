// Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "./context/AuthContext";

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-purple-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white font-bold text-xl">E-Learn</Link>
          </div>
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <div className="flex items-center text-white">
                  <UserCircleIcon className="h-6 w-6 mr-2" />
                  <span>{user?.username} ({user?.role})</span>
                </div>
                <Link to={user?.role === 'student' ? '/dashboard' : user?.role === 'instructor' ? '/dashboard2' : '/admin-dashboard'}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/courses" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Courses
                </Link>
                <Link to="/gradebook" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Gradebook
                </Link>
                <Link to="/notifications" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Notifications
                </Link>
                <Link to="/profile" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link to="/register" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}