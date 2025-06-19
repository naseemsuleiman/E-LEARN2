import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Courses from './Courses';

function Dashboard() {
  const { userRole } = useAuth();
  const [selectedTab, setSelectedTab] = useState('overview');

  const TabButton = ({ label, id }) => (
    <button
      onClick={() => setSelectedTab(id)}
      className={`px-4 py-2 rounded-lg transition-all duration-300 ${
        selectedTab === id
          ? 'bg-purple-600 text-white shadow-lg'
          : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
      }`}
    >
      {label}
    </button>
  );

  const StatsCard = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-purple-800">{value}</p>
        </div>
        <div className="text-purple-500">{icon}</div>
      </div>
    </div>
  );

  const StudentOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Enrolled Courses" 
          value="5"
          icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>} 
        />
        <StatsCard 
          title="Completed Courses" 
          value="3"
          icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>} 
        />
        <StatsCard 
          title="Assignments Due" 
          value="2"
          icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>} 
        />
        <StatsCard 
          title="Overall Progress" 
          value="75%"
          icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>} 
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-purple-800 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {/*
            Mock data for recent activity
            Replace with real data from your application
          */}
          {/*
            { action: 'Submitted assignment', course: 'Web Development', time: '2 hours ago' },
            { action: 'Completed lesson', course: 'Python Basics', time: '1 day ago' },
            { action: 'Started course', course: 'Data Science', time: '3 days ago' },
          */}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/*
          Quick action buttons for students
          Add functionality as per your application requirements
        */}
      </div>
    </div>
  );

  const TeacherOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Active Courses" 
          value="8"
          icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>} 
        />
        <StatsCard 
          title="Total Students" 
          value="156"
          icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>} 
        />
        <StatsCard 
          title="Pending Reviews" 
          value="23"
          icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>} 
        />
        <StatsCard 
          title="Average Rating" 
          value="4.8"
          icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
          </svg>} 
        />
      </div>

      {/* Course Management */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-purple-800 mb-4">Course Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Create New Course
          </button>
          <button className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Manage Assignments
          </button>
          <button className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Schedule Live Session
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8 border-l-4 border-purple-600">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">
            Welcome back, {userRole === 'teacher' ? 'Professor' : 'Student'}
          </h1>
          <p className="text-gray-600">
            {userRole === 'teacher' 
              ? 'Manage your courses and track student progress' 
              : 'Continue your learning journey'}
          </p>
        </div>

        {/* Navigation Tabs */}
<div className="flex space-x-4 mb-8">
  <TabButton label="Overview" id="overview" />
  <TabButton label="Courses" id="courses" />
  <TabButton label={userRole === 'teacher' ? 'Students' : 'Progress'} id="details" />
</div>
       {selectedTab === 'courses' && (
              <Courses userRole={userRole} />
        )}

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          userRole === 'teacher' ? <TeacherOverview /> : <StudentOverview />
        )}
      </div>
    </div>
  );
}

export default Dashboard;
