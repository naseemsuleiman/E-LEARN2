import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationList from '../components/NotificationList';
import GradebookPage from './GradebookPage';
import ProgressChart from '../components/ProgressChart';
import CertificateList from '../components/CertificateList';
import Calendar from '../components/Calendar';
import api from '../services/api';

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
            api.get('/student/courses/'),
            api.get('/gradebook/'),
            api.get('/assignments/'),
          ]);
          setStats({
            courses: coursesRes.data.length,
            grades: gradesRes.data.length,
          });
          setCourses(coursesRes.data);
          setRecentGrades(gradesRes.data.slice(-3).reverse());
          setUpcomingAssignments(assignmentsRes.data.filter(a => new Date(a.due_date) > new Date()).slice(0, 3));
        } else if (userRole === 'instructor') {
          const dashboardRes = await api.get('/instructor/dashboard/');
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

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-purple-100 via-white to-gray-100 min-h-screen">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-purple-800 mb-1 drop-shadow">{greeting}</h1>
          <div className="text-purple-400 italic font-semibold">{quote}</div>
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <CertificateList />
        </div>
      </div>
      {userRole === 'student' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded shadow p-4 text-center">
              <div className="text-2xl font-bold">{stats?.courses || 0}</div>
              <div className="text-purple-100">Courses Enrolled</div>
            </div>
            <div className="bg-gradient-to-br from-purple-300 to-purple-500 text-white rounded shadow p-4 text-center">
              <div className="text-2xl font-bold">{stats?.grades || 0}</div>
              <div className="text-purple-100">Assignments Graded</div>
            </div>
            <div className="bg-gradient-to-br from-purple-200 to-purple-400 text-white rounded shadow p-4 text-center">
              <ProgressChart />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded shadow p-4 border-l-8 border-purple-300">
              <h2 className="text-xl font-semibold mb-2 text-purple-700">Upcoming Assignments</h2>
              <ul className="space-y-2">
                {upcomingAssignments.length ? upcomingAssignments.map(a => (
                  <li key={a.id} className="flex justify-between items-center border-b pb-1">
                    <span>{a.title}</span>
                    <span className="text-xs text-gray-500">Due: {a.due_date}</span>
                  </li>
                )) : <li className="text-gray-400">No upcoming assignments.</li>}
              </ul>
            </div>
            <div className="bg-white rounded shadow p-4 border-l-8 border-purple-200">
              <h2 className="text-xl font-semibold mb-2 text-purple-700">Recently Graded</h2>
              <ul className="space-y-2">
                {recentGrades.length ? recentGrades.map(g => (
                  <li key={g.id} className="flex justify-between items-center border-b pb-1">
                    <span>{g.assignment}</span>
                    <span className="text-xs text-purple-700 font-bold">{g.grade}</span>
                  </li>
                )) : <li className="text-gray-400">No recent grades.</li>}
              </ul>
            </div>
          </div>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2 text-purple-700">Your Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-gradient-to-br from-purple-100 to-gray-100 rounded-lg shadow p-4 border flex flex-col items-center hover:scale-105 transition-transform">
                  {course.thumbnail && (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-32 object-cover rounded mb-2 shadow" />
                  )}
                  <div className="font-bold text-lg mb-1 text-purple-800">{course.title}</div>
                  <div className="text-gray-700 mb-2">{course.description}</div>
                  <a href={`/courses/${course.id}`} className="text-purple-600 hover:underline font-semibold">Go to Course</a>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-purple-50 to-gray-100 rounded shadow p-4 border-l-8 border-purple-200">
              <h2 className="text-xl font-semibold mb-2 text-purple-700">Announcements</h2>
              <NotificationList />
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-gray-100 rounded shadow p-4 border-l-8 border-purple-100">
              <h2 className="text-xl font-semibold mb-2 text-purple-700">Calendar</h2>
              <Calendar />
            </div>
          </div>
        </>
      )}
      {userRole === 'instructor' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded shadow p-4 text-center">
              <div className="text-2xl font-bold">{stats?.courses || 0}</div>
              <div className="text-purple-100">Courses Created</div>
            </div>
            <div className="bg-gradient-to-br from-purple-300 to-purple-500 text-white rounded shadow p-4 text-center">
              <div className="text-2xl font-bold">{stats?.students || 0}</div>
              <div className="text-purple-100">Students</div>
            </div>
            <div className="bg-gradient-to-br from-purple-200 to-purple-400 text-white rounded shadow p-4 text-center">
              <div className="text-2xl font-bold">${stats?.revenue || 0}</div>
              <div className="text-purple-100">Total Revenue</div>
            </div>
          </div>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2 text-purple-700">Enrolled Students by Course</h2>
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded shadow p-4 mb-4">
                <div className="font-bold text-lg text-purple-800 mb-2">{course.title}</div>
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
  );
}

export default Dashboard;

