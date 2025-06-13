// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserCircleIcon, BookOpenIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const isLoggedIn = !!localStorage.getItem("access_token");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-purple-700">E-Learn</Link>

        <div className="flex items-center gap-6">
          <Link to="/" className="text-gray-700 hover:text-purple-700">Home</Link>
          {isLoggedIn && (
            <>
              <Link to="/courses" className="text-gray-700 hover:text-purple-700 flex items-center gap-1">
                <BookOpenIcon className="w-5 h-5" />
                Courses
              </Link>
              <Link to="/profile" className="text-gray-700 hover:text-purple-700 flex items-center gap-1">
                <UserCircleIcon className="w-5 h-5" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-purple-700"
              >
                Logout
              </button>
            </>
          )}
          {!isLoggedIn && (
            <>
              <Link to="/login" className="text-gray-700 hover:text-purple-700">Login</Link>
              <Link
                to="/signup"
                className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
