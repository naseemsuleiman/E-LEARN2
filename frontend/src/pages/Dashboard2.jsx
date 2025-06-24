import React, { useState, useEffect } from 'react';
import api, { fetchDashboardData } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CreateCourse from '../components/CreateCourse';
import AssignmentList from '../components/AssignmentList';
import AnnouncementForm from '../components/AnnouncementForm';
import StudentProfileModal from '../components/StudentProfileModal';

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

  // eslint-disable-next-line no-unused-vars
  const { logout, user } = useAuth();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const { courses, stats, messages, announcements, activity, assignments, profile } = await fetchDashboardData();
      setCourses(Array.isArray(courses) ? courses : []);
      setStats(stats || { students: 0, revenue: 0, earnings: [] });
      setMessages(messages || []);
      setAnnouncements(announcements || []);
      setActivityFeed(activity || []);
      setAssignments(assignments || []);
      setProfile(profile || {});
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

  // Course actions
  const handleDeleteCourse = (id) => {
    setCourses(Array.isArray(courses) ? courses.filter(c => c.id !== id) : []);
    toast.success('Course deleted.');
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

  console.log('Courses:', courses); // Add this line before the return statement

  return (
    <div className="min-h-screen bg-gray-100 p-4 relative">
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
              <div className="bg-white p-6 rounded-lg shadow col-span-1 md:col-span-4">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FiBook className="mr-2" /> Your Courses
                  <button
                    onClick={() => setActiveTab('create')}
                    className="ml-auto px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center"
                  >
                    <FiPlus className="mr-1" /> New Course
                  </button>
                </h2>
                {Array.isArray(courses) && courses.length === 0 ? (
                  <div className="text-gray-500">You have not created any courses yet.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.isArray(courses) &&
                      courses.map((course) => (
                        <div key={course.id} className="border rounded p-4 flex flex-col justify-between shadow hover:shadow-md transition">
                          <div>
                            <h3 className="font-bold text-lg">{course.title}</h3>
                            <p className="text-gray-600 text-sm mb-2">{course.description}</p>
                            <span className={`inline-block px-2 py-1 rounded text-xs ${course.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {course.published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          <div className="flex space-x-2 mt-4">
                            <button
                              onClick={() => toast.info(`Editing ${course.title}...`)}
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
                        </div>
                      ))}
                  </div>
                )}
              </div>
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
                            onClick={() => toast.info(`Editing ${course.title}...`)}
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
      </div>

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
