import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiBook, FiUsers, FiDollarSign, FiBell, FiUploadCloud, FiSettings, FiHome, FiUser, FiBarChart2 } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const sidebarLinks = {
  instructor: [
    { to: "/dashboard", label: "Overview", icon: <FiHome /> },
    { to: "/courses", label: "Courses", icon: <FiBook /> },
    { to: "/dashboard?tab=earnings", label: "Earnings", icon: <FiDollarSign /> },
    { to: "/dashboard?tab=students", label: "Students", icon: <FiUsers /> },
    { to: "/dashboard?tab=announcements", label: "Announcements", icon: <FiBell /> },
    { to: "/dashboard?tab=assignments", label: "Assignments", icon: <FiUploadCloud /> },
    { to: "/dashboard?tab=analytics", label: "Analytics", icon: <FiBarChart2 /> },
    { to: "/profile", label: "Profile", icon: <FiUser /> },
    { to: "/settings", label: "Settings", icon: <FiSettings /> },
  ],
  student: [
    { to: "/dashboard", label: "Overview", icon: <FiHome /> },
    { to: "/my-courses", label: "My Courses", icon: <FiBook /> },
    { to: "/gradebook", label: "Gradebook", icon: <FiBarChart2 /> },
    { to: "/certificates", label: "Certificates", icon: <FiUploadCloud /> },
    { to: "/wishlist", label: "Wishlist", icon: <FiBell /> },
    { to: "/profile", label: "Profile", icon: <FiUser /> },
    { to: "/settings", label: "Settings", icon: <FiSettings /> },
  ],
  admin: [
    { to: "/admin-dashboard", label: "Admin Home", icon: <FiHome /> },
    { to: "/users", label: "Users", icon: <FiUsers /> },
    { to: "/courses", label: "Courses", icon: <FiBook /> },
    { to: "/analytics", label: "Analytics", icon: <FiBarChart2 /> },
    { to: "/settings", label: "Settings", icon: <FiSettings /> },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const role = user?.role || "student";
  const links = sidebarLinks[role] || sidebarLinks["student"];

  return (
    <aside className="hidden md:block w-64 bg-emerald-700 text-white min-h-screen shadow-lg sticky top-0 z-40">
      <div className="p-6 flex flex-col space-y-2">
        <div className="mb-6 flex items-center space-x-2">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="font-bold text-lg">E-Learn</span>
        </div>
        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 space-x-3 ${location.pathname === link.to.split('?')[0] ? 'bg-emerald-800 text-white font-semibold' : 'hover:bg-emerald-600 hover:text-white'}`}
          >
            <span className="text-xl">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
} 