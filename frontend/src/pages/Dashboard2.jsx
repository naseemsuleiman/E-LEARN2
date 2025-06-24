import React, { useState, useEffect } from 'react';
import api, { fetchDashboardData } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CreateCourse from '../components/CreateCourse';

import {
  FiBook,
  FiUsers,
  FiDollarSign,
  FiMessageSquare,
  FiCalendar,
  FiPlus,
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
  const [preview, setPreview] = useState(null);
  const [activeDetail, setActiveDetail] = useState(null);
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);



  const { logout } = useAuth();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const { courses, stats, messages } = await fetchDashboardData();
      setCourses(courses || []);
      setStats(stats || { students: 0, revenue: 0, earnings: [] });
      setMessages(messages || []);
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

  return (
    <div className="min-h-screen bg-gray-100 p-4 relative">
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center text-purple-700">
            <FiBook className="mr-2" /> Instructor Dashboard
          </h1>
        </header>

        <div className="flex space-x-4 border-b mb-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: FiBook },
            { id: 'calendar', label: 'Calendar', icon: FiCalendar },
            { id: 'create', label: 'Create Course', icon: FiPlus },
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

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'courses', icon: <FiBook />, label: 'Courses', value: courses.length },
                  { id: 'students', icon: <FiUsers />, label: 'Students', value: stats.students },
                  { id: 'revenue', icon: <FiDollarSign />, label: 'Revenue', value: `$${stats.revenue}` },
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
            </>
          )}

          {activeTab === 'calendar' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Schedule Events</h2>
              <Calendar
                onChange={setDate}
                value={date}
                tileContent={({ date, view }) => {
                  const dayEvents = events.filter(
                    (event) => new Date(event.date).toDateString() === date.toDateString()
                  );
                  return (
                    <ul className="text-xs text-purple-500">
                      {dayEvents.map((ev, i) => (
                        <li key={i}>📌 {ev.title}</li>
                      ))}
                    </ul>
                  );
                }}
              />
              <div className="mt-4">
                <h3 className="font-semibold">Selected Date: {date.toDateString()}</h3>
                <form
                  className="flex flex-col space-y-2 mt-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const title = e.target.title.value.trim();
                    if (!title) return;
                    setEvents([...events, { date, title }]);
                    e.target.reset();
                  }}
                >
                  <input
                    type="text"
                    name="title"
                    placeholder="Event title"
                    className="border p-2 rounded"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                  >
                    Add Event
                  </button>
                </form>

                <h4 className="mt-4 font-semibold">Events on {date.toDateString()}</h4>
                <ul className="space-y-1">
                  {events
                    .filter(
                      (event) =>
                        new Date(event.date).toDateString() === date.toDateString()
                    )
                    .map((event, i) => (
                      <li
                        key={i}
                        className="flex justify-between items-center bg-gray-100 p-2 rounded"
                      >
                        {event.title}
                        <button
                          onClick={() =>
                            setEvents(events.filter((_, index) => index !== i))
                          }
                          className="ml-4 text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}
          {activeTab === 'create' && (
            <CreateCourse 
              setActiveTab={setActiveTab} 
              setCourses={setCourses} 
            />
          )}



        </motion.div>
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

              {activeDetail === 'courses' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Your Courses</h2>
                  <ul className="space-y-4">
                    {(Array.isArray(courses) ? courses : []).map(course => (
                      <li key={course.id} className="border p-4 rounded">
                        <h3 className="text-lg font-semibold">{course.title}</h3>
                        <p className="text-gray-600">{course.description}</p>
                        <button
                          onClick={() => {

                            toast.info(`Editing ${course.title}...`);
                          }}
                          className="mt-2 px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                        >
                          Edit
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeDetail === 'students' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Enrolled Students</h2>
                  <ul className="space-y-2">
                    {stats.enrollments && stats.enrollments.length > 0 ? (
                      stats.enrollments.map((enrollment, idx) => (
                        <li key={idx} className="border p-3 rounded flex justify-between">
                          <span>{enrollment.student}</span>
                          <span className="text-gray-500">{enrollment.course}</span>
                        </li>
                      ))
                    ) : (
                      <p>No enrollments found.</p>
                    )}
                  </ul>
                </div>
              )}

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
            </motion.div>
          </div>
        )}

      </div>

      {showChat && (
        <ChatPopover messages={messages} onClose={() => setShowChat(false)} />
      )}
    </div>
  );
}

export default InstructorDashboard;
