import React, { useState, useEffect } from 'react';
import apiService, { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CreateCourse from '../components/CreateCourse';
import AssignmentList from '../components/AssignmentList';
import AnnouncementForm from '../components/AnnouncementForm';
import StudentProfileModal from '../components/StudentProfileModal';
import CourseEditModal from '../components/CourseEditModal';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';

import {
  FiBook,
  FiUsers,
  FiDollarSign,
  FiMessageSquare,
  FiCalendar,
  FiPlus,
  FiBell,
  FiSettings,
  FiEdit,
  FiTrash2,
  FiEye,
  FiUser,
  FiUploadCloud,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import { motion } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ChatPopover from '../components/ChatPopover';
import 'react-toastify/dist/ReactToastify.css';
import 'react-loading-skeleton/dist/skeleton.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ students: 0, revenue: 0, earnings: [] });
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showChat, setShowChat] = useState(false);
  const [activeDetail, setActiveDetail] = useState(null);
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [profile, setProfile] = useState({ name: '', email: '', avatar: '' });
  const [editingCourse, setEditingCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  // eslint-disable-next-line no-unused-vars
  const { logout, user } = useAuth();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const dashboardData = await apiService.getInstructorDashboard();
      setCourses(Array.isArray(dashboardData.courses) ? dashboardData.courses : []);
      setStats(dashboardData.stats || { students: 0, revenue: 0, earnings: [] });
      setMessages(dashboardData.messages || []);
      setAnnouncements(dashboardData.announcements || []);
      setActivityFeed(dashboardData.activity || []);
      setAssignments(dashboardData.assignments || []);
      setProfile(dashboardData.profile || {});
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Push Notification Example: on new message
  useEffect(() => {
    if (messages.length) {
      toast.info(`📬 New message from ${messages[0].sender}`);
    }
  }, [messages]);

  // Announcements
  const handleAnnouncementSubmit = async (text) => {
    try {
      // Replace with your API call
      setAnnouncements([{ text, date: new Date(), author: profile.name }, ...announcements]);
      toast.success('Announcement posted!');
    } catch {
      toast.error('Failed to post announcement.');
    }
  };

// Example function to handle course creation with file upload
const handleCreateCourse = async (values) => {
  const formData = new FormData();
  formData.append('title', values.title);
  formData.append('description', values.description);
  // append other text fields...
  if (values.thumbnail instanceof File) {
    formData.append('thumbnail', values.thumbnail);
  }

  await api.post('/api/courses/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};


  // Course actions
  const handleDeleteCourse = async (id) => {
    try {
      await apiService.deleteCourse(id);
      setCourses(Array.isArray(courses) ? courses.filter(c => c.id !== id) : []);
      toast.success('Course deleted.');
    } catch {
      toast.error('Failed to delete course.');
    }
  };

  const handleEditCourse = async (id, data) => {
    try {
      const updated = await apiService.updateCourse(id, data);
      setCourses(Array.isArray(courses) ? courses.map(c => c.id === id ? updated : c) : []);
      toast.success('Course updated.');
    } catch {
      toast.error('Failed to update course.');
    }
  };

  const handleTogglePublish = (id) => {
    setCourses(
      Array.isArray(courses)
        ? courses.map(c =>
            c.id === id ? { ...c, published: !c.published } : c
          )
        : []
    );
    toast.info('Course publish status changed.');
  };

  // Student actions
  const handleViewStudent = (student) => setSelectedStudent(student);

  // Module handlers
  const addModule = () => {
    setModules(prev => ([...prev, { title: '', description: '', order: prev.length + 1, lessons: [] }]));
  };
  const updateModule = (idx, field, value) => {
    setModules(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));
  };
  const removeModule = (idx) => {
    setModules(prev => prev.filter((_, i) => i !== idx));
  };
  // Lesson handlers (per module)
  const addLesson = (modIdx) => {
    setModules(prev => prev.map((m, i) => i === modIdx ? { ...m, lessons: [...m.lessons, { title: '', content: '', order: m.lessons.length + 1, lesson_type: 'video' }] } : m));
  };
  const updateLesson = (modIdx, lesIdx, field, value) => {
    setModules(prev => prev.map((m, i) => i === modIdx ? { ...m, lessons: m.lessons.map((l, j) => j === lesIdx ? { ...l, [field]: value } : l) } : m));
  };
  const removeLesson = (modIdx, lesIdx) => {
    setModules(prev => prev.map((m, i) => i === modIdx ? { ...m, lessons: m.lessons.filter((_, j) => j !== lesIdx) } : m));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess(false);
    if (passwords.new_password !== passwords.confirm_password) {
      setPwError("New passwords do not match.");
      return;
    }
    try {
      await api.post('/api/change-password/', passwords);
      setPwSuccess(true);
      setPasswords({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPwError("Failed to change password.");
    }
  };

  // Example: Courses section with polish
  const renderCoursesSection = () => (
    <div className="bg-white rounded-lg shadow p-6 mb-6 border border-emerald-100">
      <h2 className="text-xl font-bold text-emerald-700 mb-4">My Courses</h2>
      {loading ? (
        <div className="flex justify-center py-8"><LoadingSpinner /></div>
      ) : courses.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No courses yet!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-emerald-50 rounded-lg shadow p-4 border border-emerald-100 flex flex-col">
              <img src={course.thumbnail || '/default-course.png'} alt={course.title} className="w-full h-32 object-cover rounded mb-3 border border-emerald-200" />
              <h3 className="font-semibold text-emerald-800 text-lg mb-1">{course.title}</h3>
              <div className="text-gray-600 text-sm mb-2">{course.short_description}</div>
              <div className="flex-1" />
              <div className="flex items-center justify-between mt-2">
                <span className="text-emerald-700 font-bold">${course.price}</span>
                <span className="text-xs text-gray-400">{course.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Announcements section
  const renderAnnouncementsSection = () => (
    <div className="bg-white rounded-lg shadow p-6 mb-6 border border-emerald-100">
      <h2 className="text-xl font-bold text-emerald-700 mb-4">Announcements</h2>
      {loading ? (
        <div className="flex justify-center py-8"><LoadingSpinner /></div>
      ) : announcements.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No announcements yet!</div>
      ) : (
        <ul className="space-y-4">
          {announcements.map((a, i) => (
            <li key={i} className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
              <div className="font-semibold text-emerald-800">{a.title || a.text}</div>
              <div className="text-gray-600 text-sm mb-1">{a.content || a.text}</div>
              <div className="text-xs text-gray-400">{a.date ? new Date(a.date).toLocaleString() : ''}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  // Assignments section
  const renderAssignmentsSection = () => (
    <div className="bg-white rounded-lg shadow p-6 mb-6 border border-emerald-100">
      <h2 className="text-xl font-bold text-emerald-700 mb-4">Assignments</h2>
      {loading ? (
        <div className="flex justify-center py-8"><LoadingSpinner /></div>
      ) : assignments.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No assignments yet!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map(a => (
            <div key={a.id} className="bg-emerald-50 rounded-lg shadow p-4 border border-emerald-100 flex flex-col">
              <div className="font-semibold text-emerald-800 text-lg mb-1">{a.title}</div>
              <div className="text-gray-600 text-sm mb-2">{a.description}</div>
              <div className="flex-1" />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">Due: {a.due_date}</span>
                <span className="text-xs text-emerald-700 font-bold">{a.max_points} pts</span>
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
        <ToastContainer />
        <div className="max-w-7xl mx-auto">
          {/* Profile Quick Access */}
          <header className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <img
                src={profile.avatar || '/default-avatar.png'}
                alt="avatar"
                className="w-12 h-12 rounded-full border"
              />
              <div>
                <h1 className="text-2xl font-bold text-purple-700 flex items-center">
                  <FiBook className="mr-2" /> {profile.name || 'Instructor'}
                </h1>
                <p className="text-gray-500">{profile.email}</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="flex items-center px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              <FiSettings className="mr-1" /> Settings
            </button>
          </header>

          {/* Tabs */}
          <div className="flex space-x-4 border-b mb-6 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: FiBook },
              { id: 'calendar', label: 'Calendar', icon: FiCalendar },
              { id: 'announcements', label: 'Announcements', icon: FiBell },
              { id: 'assignments', label: 'Assignments', icon: FiUploadCloud },
              { id: 'create', label: 'Create Course', icon: FiPlus },
              { id: 'students', label: 'Students', icon: FiUsers },
              { id: 'earnings', label: 'Earnings', icon: FiDollarSign },
              { id: 'progress', label: 'Student Progress', icon: FiUsers },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 ${activeTab === tab.id
                  ? 'border-b-2 border-purple-500 text-purple-600'
                  : 'text-gray-600'
                  }`}
              >
                <tab.icon className="mr-1" /> {tab.label}
              </button>
            ))}

            <button
              onClick={() => setShowChat(!showChat)}
              className="flex items-center ml-auto px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              <FiMessageSquare className="mr-1" /> Messages
            </button>
          </div>

          {/* Main Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Stats */}
                  {[
                    { id: 'courses', icon: <FiBook />, label: 'Courses', value: Array.isArray(courses) ? courses.length : 0 },
                    { id: 'students', icon: <FiUsers />, label: 'Students', value: stats.students },
                    { id: 'revenue', icon: <FiDollarSign />, label: 'Revenue', value: `$${stats.revenue}` },
                    { id: 'assignments', icon: <FiUploadCloud />, label: 'Assignments', value: Array.isArray(assignments) ? assignments.length : 0 },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveDetail(item.id)}
                      className="bg-white p-6 rounded-lg shadow flex items-center space-x-4 w-full text-left hover:shadow-md transition"
                    >
                      <span className="text-3xl text-purple-500">{item.icon}</span>
                      <div>
                        <p className="text-gray-500">{item.label}</p>
                        <p className="text-2xl font-bold">
                          {loading ? <Skeleton width={50} /> : item.value}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Earnings Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">Earnings Chart</h2>
                  {loading ? (
                    <Skeleton height={200} />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={stats.earnings}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="amount" stroke="#a78bfa" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Recent Activity Feed */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                  <ul className="space-y-2">
                    {activityFeed.length === 0 && <li>No recent activity.</li>}
                    {activityFeed.map((activity, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-gray-700">
                        <span className="text-purple-500">{activity.icon ? <activity.icon /> : <FiCheckCircle />}</span>
                        <span>{activity.text}</span>
                        <span className="ml-auto text-xs text-gray-400">{activity.time}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Courses Preview Card in Overview */}
                {renderCoursesSection()}
              </>
            )}

            {/* Calendar Tab */}
            {activeTab === 'calendar' && (
              <div className="bg-white p-6 rounded-lg shadow-lg border border-purple-100">
                <h2 className="text-2xl font-bold mb-6 flex items-center text-purple-700">
                  <FiCalendar className="mr-2" /> Schedule Events
                </h2>
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Calendar */}
                  <div className="md:w-1/2">
                    <Calendar
                      onChange={setDate}
                      value={date}
                      tileContent={({ date: tileDate }) => {
                        const dayEvents = events.filter(
                          (event) => new Date(event.date).toDateString() === tileDate.toDateString()
                        );
                        return (
                          <ul className="text-xs text-purple-500">
                            {dayEvents.map((ev, i) => (
                              <li key={i}>📌</li>
                            ))}
                          </ul>
                        );
                      }}
                      className="rounded-lg shadow border border-purple-200"
                      tileClassName={({ date: tileDate }) =>
                        events.some(ev => new Date(ev.date).toDateString() === tileDate.toDateString())
                          ? 'bg-purple-50'
                          : undefined
                      }
                    />
                  </div>
                  {/* Event Form & List */}
                  <div className="md:w-1/2 flex flex-col">
                    <div className="bg-purple-50 p-4 rounded-lg shadow mb-6 border border-purple-200">
                      <h3 className="font-semibold text-purple-700 mb-2">
                        Selected Date: <span className="font-mono">{date.toDateString()}</span>
                      </h3>
                      <form
                        className="flex flex-col gap-2"
                        onSubmit={e => {
                          e.preventDefault();
                          const title = e.target.title.value.trim();
                          if (!title) return;
                          setEvents([...events, { id: Date.now(), date, title }]);
                          e.target.reset();
                        }}
                      >
                        <input
                          type="text"
                          name="title"
                          placeholder="Event title"
                          className="border border-purple-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                          required
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded shadow hover:from-purple-600 hover:to-purple-800 transition"
                        >
                          Add Event
                        </button>
                      </form>
                    </div>
                    <div className="bg-white rounded-lg shadow border border-purple-100 p-4 flex-1">
                      <h4 className="font-semibold text-purple-700 mb-3">
                        Events on <span className="font-mono">{date.toDateString()}</span>
                      </h4>
                      <ul className="space-y-3">
                        {events
                          .filter(ev => new Date(ev.date).toDateString() === date.toDateString())
                          .map((event, i) => (
                            <EventItem
                              key={event.id}
                              event={event}
                              onEdit={updatedTitle => {
                                setEvents(events.map(ev =>
                                  ev.id === event.id ? { ...ev, title: updatedTitle } : ev
                                ));
                              }}
                              onDelete={() => {
                                setEvents(events.filter(ev => ev.id !== event.id));
                              }}
                            />
                          ))}
                        {events.filter(ev => new Date(ev.date).toDateString() === date.toDateString()).length === 0 && (
                          <li className="text-gray-400 italic">No events for this date.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Announcements Tab */}
            {activeTab === 'announcements' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Announcements</h2>
                <AnnouncementForm onSubmit={handleAnnouncementSubmit} />
                <ul className="mt-4 space-y-3">
                  {announcements.length === 0 && <li>No announcements yet.</li>}
                  {announcements.map((a, idx) => (
                    <li key={idx} className="border p-3 rounded flex flex-col">
                      <span className="font-semibold">{a.author || profile.name}</span>
                      <span>{a.text}</span>
                      <span className="text-xs text-gray-400">{new Date(a.date).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Assignments Tab */}
            {activeTab === 'assignments' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Assignments Overview</h2>
                {/* Assignment Posting Form */}
                <form
                  className="mb-6 space-y-3"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target;
                    const title = form.title.value.trim();
                    const description = form.description.value.trim();
                    if (!title || !description) {
                      toast.error('Title and description are required.');
                      return;
                    }
                    // Optionally, send to backend here:
                    // const res = await api.post('/assignments/', { title, description });
                    // const newAssignment = res.data;
                    const newAssignment = {
                      id: Date.now(),
                      title,
                      description,
                      date: new Date().toISOString(),
                    };
                    setAssignments(prev => [newAssignment, ...prev]);
                    toast.success('Assignment posted!');
                    form.reset();
                  }}
                >
                  <input
                    name="title"
                    placeholder="Assignment Title"
                    className="w-full px-4 py-2 border rounded"
                    required
                  />
                  <textarea
                    name="description"
                    placeholder="Assignment Description"
                    className="w-full px-4 py-2 border rounded"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                  >
                    Post Assignment
                  </button>
                </form>
                {/* Assignment List */}
                <AssignmentList assignments={assignments} />
              </div>
            )}

            {/* Create Course Tab */}
            {activeTab === 'create' && (
              <CreateCourse
                setActiveTab={setActiveTab}
                setCourses={newCourses => setCourses(Array.isArray(newCourses) ? newCourses : [])}
                courses={courses}
              />
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Enrolled Students</h2>
                <ul className="space-y-2">
                  {stats.enrollments && stats.enrollments.length > 0 ? (
                    stats.enrollments.map((enrollment, idx) => (
                      <li key={idx} className="border p-3 rounded flex justify-between items-center">
                        <span className="flex items-center">
                          <FiUser className="mr-2" />
                          {enrollment.student}
                        </span>
                        <span className="text-gray-500">{enrollment.course}</span>
                        <button
                          onClick={() => handleViewStudent(enrollment)}
                          className="ml-4 px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                        >
                          View
                        </button>
                      </li>
                    ))
                  ) : (
                    <p>No enrollments found.</p>
                  )}
                </ul>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Profile & Settings</h2>
                <div>
                  <p>Name: {profile.name}</p>
                  <p>Email: {profile.email}</p>
                  {/* Add more settings as needed */}
                  <button
                    onClick={logout}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
                <div className="mt-8">
                  <h2 className="text-xl font-bold mb-2 text-emerald-700">Change Password</h2>
                  <form onSubmit={handlePasswordChange} className="space-y-3">
                    <input
                      type="password"
                      placeholder="Current Password"
                      value={passwords.old_password}
                      onChange={e => setPasswords({ ...passwords, old_password: e.target.value })}
                      className="bg-gray-100 p-2 rounded-lg w-full border border-gray-200"
                      required
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      value={passwords.new_password}
                      onChange={e => setPasswords({ ...passwords, new_password: e.target.value })}
                      className="bg-gray-100 p-2 rounded-lg w-full border border-gray-200"
                      required
                    />
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      value={passwords.confirm_password}
                      onChange={e => setPasswords({ ...passwords, confirm_password: e.target.value })}
                      className="bg-gray-100 p-2 rounded-lg w-full border border-gray-200"
                      required
                    />
                    <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                      Change Password
                    </button>
                    {pwError && <div className="text-red-600">{pwError}</div>}
                    {pwSuccess && <div className="text-emerald-600">Password changed successfully!</div>}
                  </form>
                </div>
              </div>
            )}
          </motion.div>

          {/* Course/Stats Detail Modal */}
          {activeDetail && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="bg-white p-6 rounded-lg max-w-2xl w-full shadow-lg relative overflow-y-auto max-h-[90vh]"
              >
                <button
                  onClick={() => setActiveDetail(null)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>

                {/* Courses Detail */}
                {activeDetail === 'courses' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Your Courses</h2>
                    <ul className="space-y-4">
                      {(Array.isArray(courses) ? courses : []).map(course => (
                        <li key={course.id} className="border p-4 rounded flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{course.title}</h3>
                            <p className="text-gray-600">{course.description}</p>
                            <span className={`inline-block mt-1 px-2 py-1 rounded text-xs ${course.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {course.published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          <div className="flex space-x-2 mt-2 md:mt-0">
                            <button
                              onClick={() => setEditingCourse(course)}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
                            >
                              <FiEdit className="mr-1" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center"
                            >
                              <FiTrash2 className="mr-1" /> Delete
                            </button>
                            <button
                              onClick={() => handleTogglePublish(course.id)}
                              className={`px-3 py-1 rounded flex items-center ${course.published ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-green-500 text-white hover:bg-green-600'}`}
                            >
                              {course.published ? <FiXCircle className="mr-1" /> : <FiCheckCircle className="mr-1" />}
                              {course.published ? 'Unpublish' : 'Publish'}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Students Detail */}
                {activeDetail === 'students' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Enrolled Students</h2>
                    <ul className="space-y-2">
                      {stats.enrollments && stats.enrollments.length > 0 ? (
                        stats.enrollments.map((enrollment, idx) => (
                          <li key={idx} className="border p-3 rounded flex justify-between items-center">
                            <span>{enrollment.student}</span>
                            <span className="text-gray-500">{enrollment.course}</span>
                            <button
                              onClick={() => handleViewStudent(enrollment)}
                              className="ml-4 px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                            >
                              View
                            </button>
                          </li>
                        ))
                      ) : (
                        <p>No enrollments found.</p>
                      )}
                    </ul>
                  </div>
                )}

                {/* Revenue Detail */}
                {activeDetail === 'revenue' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Payments Received</h2>
                    <ul className="space-y-2">
                      {stats.payments && stats.payments.length > 0 ? (
                        stats.payments.map((payment, idx) => (
                          <li key={idx} className="border p-3 rounded flex justify-between">
                            <span>{payment.student}</span>
                            <span className="text-green-600">${payment.amount}</span>
                          </li>
                        ))
                      ) : (
                        <p>No payments found.</p>
                      )}
                    </ul>
                  </div>
                )}

                {/* Assignments Detail */}
                {activeDetail === 'assignments' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Assignments</h2>
                    <AssignmentList assignments={assignments} />
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {/* Student Profile Modal */}
          {selectedStudent && (
            <StudentProfileModal
              student={selectedStudent}
              onClose={() => setSelectedStudent(null)}
            />
          )}

          {/* Render CourseEditModal if editingCourse is set */}
          {editingCourse && (
            <CourseEditModal
              course={editingCourse}
              onClose={() => setEditingCourse(null)}
              onSave={async (updatedCourse) => {
                await handleEditCourse(editingCourse.id, updatedCourse);
                setEditingCourse(null);
              }}
            />
          )}
        </div>
      </main>

      {showChat && (
        <ChatPopover messages={messages} onClose={() => setShowChat(false)} />
      )}
    </div>
  );
}

export default InstructorDashboard;

// Add this component at the bottom of the file (before export)
function EventItem({ event, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(event.title);

  return (
    <li className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded px-3 py-2 shadow-sm">
      {editing ? (
        <form
          className="flex-1 flex items-center gap-2"
          onSubmit={e => {
            e.preventDefault();
            if (editTitle.trim()) {
              onEdit(editTitle.trim());
              setEditing(false);
            }
          }}
        >
          <input
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            className="border border-purple-300 rounded px-2 py-1 flex-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
            autoFocus
          />
          <button
            type="submit"
            className="px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
            title="Save"
          >
            Save
          </button>
          <button
            type="button"
            className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            onClick={() => setEditing(false)}
            title="Cancel"
          >
            Cancel
          </button>
        </form>
      ) : (
        <>
          <span className="flex-1 text-purple-800 font-medium">{event.title}</span>
          <div className="flex gap-2 ml-2">
            <button
              onClick={() => setEditing(true)}
              className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              title="Edit"
            >
              <FiEdit />
            </button>
            <button
              onClick={onDelete}
              className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
              title="Delete"
            >
              <FiTrash2 />
            </button>
          </div>
        </>
      )}
    </li>
  );
}
