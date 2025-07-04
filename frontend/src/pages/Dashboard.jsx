import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationList from '../components/NotificationList';
import GradebookPage from './GradebookPage';
import ProgressChart from '../components/ProgressChart';
import CertificateList from '../components/CertificateList';
import Calendar from '../components/Calendar';
import apiService, { api } from '../services/api';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';

function Dashboard() {
  const { user } = useAuth();
  const userRole = user?.role;
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [recentGrades, setRecentGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseStudents, setCourseStudents] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        if (userRole === 'student') {
          const [coursesRes, gradesRes, assignmentsRes] = await Promise.all([
            api.get('/api/student/courses/'),
            api.get('/api/gradebook/'),
            api.get('/api/assignments/'),
          ]);
          setStats({
            courses: coursesRes.data.length,
            grades: gradesRes.data.length,
          });
          setCourses(coursesRes.data);
          setRecentGrades(gradesRes.data.slice(-3).reverse());
          setUpcomingAssignments(assignmentsRes.data.filter(a => new Date(a.due_date) > new Date()).slice(0, 3));
        } else if (userRole === 'instructor') {
          const dashboardRes = await api.get('/api/instructor/dashboard/');
          setStats({
            courses: dashboardRes.data.courses.length,
            students: dashboardRes.data.stats.students,
            revenue: dashboardRes.data.stats.revenue,
          });
          setCourses(dashboardRes.data.courses);
          setCourseStudents(dashboardRes.data.course_students || {});
        }
      } catch {
        setStats(null);
        setCourses([]);
        setUpcomingAssignments([]);
        setRecentGrades([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [userRole]);

  if (loading) return <div className="text-center py-10">Loading dashboard...</div>;

  // Personalized greeting and motivational quote
  const greeting = user ? `Welcome back, ${user.username}!` : 'Welcome!';
  const quote = "Learning never exhausts the mind. – Leonardo da Vinci";

  // Example: Enrolled Courses section with polish
  const renderEnrolledCoursesSection = () => (
    <div className="bg-white rounded-lg shadow p-6 mb-6 border border-emerald-100">
      <h2 className="text-xl font-bold text-emerald-700 mb-4">My Enrolled Courses</h2>
      {loading ? (
        <div className="flex justify-center py-8"><LoadingSpinner /></div>
      ) : courses.length === 0 ? (
        <div className="text-gray-500 text-center py-8">You are not enrolled in any courses yet!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-emerald-50 rounded-lg shadow p-4 border border-emerald-100 flex flex-col">
              <img src={course.thumbnail || '/default-course.png'} alt={course.title} className="w-full h-32 object-cover rounded mb-3 border border-emerald-200" />
              <h3 className="font-semibold text-emerald-800 text-lg mb-1">{course.title}</h3>
              <div className="text-gray-600 text-sm mb-2">{course.short_description}</div>
              <div className="flex-1" />
              <div className="flex items-center justify-between mt-2">
                <span className="text-emerald-700 font-bold">{course.progress || 0}% complete</span>
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
        <div className="max-w-7xl mx-auto">
          {renderEnrolledCoursesSection()}
          <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-emerald-50 via-white to-teal-50 min-h-screen">
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-emerald-800 mb-1 drop-shadow">{greeting}</h1>
                <div className="text-emerald-600 italic font-semibold">{quote}</div>
              </div>
              <div className="flex space-x-4 mt-4 md:mt-0">
                <CertificateList />
              </div>
            </div>
            {userRole === 'student' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-lg shadow-lg p-4 text-center">
                    <div className="text-2xl font-bold">{stats?.courses || 0}</div>
                    <div className="text-emerald-100">Courses Enrolled</div>
                  </div>
                  <div className="bg-gradient-to-br from-teal-500 to-teal-700 text-white rounded-lg shadow-lg p-4 text-center">
                    <div className="text-2xl font-bold">{stats?.grades || 0}</div>
                    <div className="text-teal-100">Assignments Graded</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-lg shadow-lg p-4 text-center">
                    <ProgressChart />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow-lg p-4 border-l-8 border-emerald-400">
                    <h2 className="text-xl font-semibold mb-2 text-emerald-700">Upcoming Assignments</h2>
                    <ul className="space-y-2">
                      {upcomingAssignments.length ? upcomingAssignments.map(a => (
                        <li key={a.id} className="flex justify-between items-center border-b pb-1">
                          <span>{a.title}</span>
                          <span className="text-xs text-gray-500">Due: {a.due_date}</span>
                        </li>
                      )) : <li className="text-gray-400">No upcoming assignments.</li>}
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg p-4 border-l-8 border-teal-400">
                    <h2 className="text-xl font-semibold mb-2 text-teal-700">Recently Graded</h2>
                    <ul className="space-y-2">
                      {recentGrades.length ? recentGrades.map(g => (
                        <li key={g.id} className="flex justify-between items-center border-b pb-1">
                          <span>{g.assignment?.title || 'Unknown Assignment'}</span>
                          <span className="text-xs text-emerald-700 font-bold">{g.grade || 'Not graded'}</span>
                        </li>
                      )) : <li className="text-gray-400">No recent grades.</li>}
                    </ul>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg shadow-lg p-4 border-l-8 border-emerald-300">
                    <h2 className="text-xl font-semibold mb-2 text-emerald-700">Announcements</h2>
                    <NotificationList />
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg shadow-lg p-4 border-l-8 border-teal-300">
                    <h2 className="text-xl font-semibold mb-2 text-teal-700">Calendar</h2>
                    <Calendar />
                  </div>
                </div>
              </>
            )}
            {userRole === 'instructor' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-lg shadow-lg p-4 text-center">
                    <div className="text-2xl font-bold">{stats?.courses || 0}</div>
                    <div className="text-emerald-100">Courses Created</div>
                  </div>
                  <div className="bg-gradient-to-br from-teal-500 to-teal-700 text-white rounded-lg shadow-lg p-4 text-center">
                    <div className="text-2xl font-bold">{stats?.students || 0}</div>
                    <div className="text-teal-100">Students</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-lg shadow-lg p-4 text-center">
                    <div className="text-2xl font-bold">${stats?.revenue || 0}</div>
                    <div className="text-emerald-100">Total Revenue</div>
                  </div>
                </div>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-2 text-emerald-700">Enrolled Students by Course</h2>
                  {courses.map((course) => (
                    <div key={course.id} className="bg-white rounded-lg shadow-lg p-4 mb-4 border border-emerald-100">
                      <div className="font-bold text-lg text-emerald-800 mb-2">{course.title}</div>
                      <ul className="list-disc ml-6">
                        {(courseStudents && courseStudents[course.id] && courseStudents[course.id].length) ? (
                          courseStudents[course.id].map((student) => (
                            <li key={student.id} className="text-gray-700">{student.username} ({student.email})</li>
                          ))
                        ) : (
                          <li className="text-gray-400">No students enrolled yet.</li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;

