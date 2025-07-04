import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import LoadingSpinner from '../components/LoadingSpinner'

function AdminDashboard() {
  const [adminData, setAdminData] = useState({ users: [], courses: [] });
  const [loading, setLoading] = useState(true);

  const handleDeleteUser = (userId) => {
    // Handle user deletion logic
    console.log('Delete user:', userId);
  };

  const handleDeleteCourse = (courseId) => {
    // Handle course deletion logic
    console.log('Delete course:', courseId);
  };

  // Example: Users section with polish
  const renderUsersSection = () => (
    <div className="bg-white rounded-lg shadow p-6 mb-6 border border-emerald-100">
      <h2 className="text-xl font-bold text-emerald-700 mb-4">Users</h2>
      {loading ? (
        <div className="flex justify-center py-8"><LoadingSpinner /></div>
      ) : adminData.users.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No users found!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminData.users.map(user => (
            <div key={user.id} className="bg-emerald-50 rounded-lg shadow p-4 border border-emerald-100 flex flex-col">
              <div className="font-semibold text-emerald-800 text-lg mb-1">{user.username}</div>
              <div className="text-gray-600 text-sm mb-2">{user.email}</div>
              <div className="flex-1" />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">{user.role}</span>
                <span className="text-xs text-emerald-700 font-bold">ID: {user.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Example: Courses section with polish
  const renderCoursesSection = () => (
    <div className="bg-white rounded-lg shadow p-6 mb-6 border border-emerald-100">
      <h2 className="text-xl font-bold text-emerald-700 mb-4">Courses</h2>
      {loading ? (
        <div className="flex justify-center py-8"><LoadingSpinner /></div>
      ) : adminData.courses.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No courses found!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminData.courses.map(course => (
            <div key={course.id} className="bg-emerald-50 rounded-lg shadow p-4 border border-emerald-100 flex flex-col">
              <img src={course.thumbnail || '/default-course.png'} alt={course.title} className="w-full h-32 object-cover rounded mb-3 border border-emerald-200" />
              <h3 className="font-semibold text-emerald-800 text-lg mb-1">{course.title}</h3>
              <div className="text-gray-600 text-sm mb-2">{course.short_description}</div>
              <div className="flex-1" />
              <div className="flex items-center justify-between mt-2">
                <span className="text-emerald-700 font-bold">{course.instructor?.username || 'Unknown'}</span>
                <span className="text-xs text-gray-400">{course.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8">
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-emerald-700 mb-8">Admin Dashboard</h1>
            
            {renderUsersSection()}
            {renderCoursesSection()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
