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
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useLocation, useNavigate } from 'react-router-dom';
import NotificationForm from '../components/NotificationForm';

// Instructor course management (edit/delete) is now handled in InstructorCourses.jsx. Dashboard only previews courses.
function Dashboard() {
  const { user } = useAuth();
  const userRole = user?.role;
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [recentGrades, setRecentGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseStudents, setCourseStudents] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [announcementsError, setAnnouncementsError] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [assignmentForm, setAssignmentForm] = useState({ title: "", description: "" });
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    price: 0,
    requirements: [''],
    outcomes: [''],
    difficulty: 'beginner',
    thumbnail: null
  });
  const [modules, setModules] = useState([]);
  const [createMsg, setCreateMsg] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [pwForm, setPwForm] = useState({ old: "", new1: "", new2: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignmentsError, setAssignmentsError] = useState("");
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState("");
  const [earnings, setEarnings] = useState([]);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [earningsError, setEarningsError] = useState("");
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  // Sync tab with URL query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && tab !== activeTab) setActiveTab(tab);
  }, [location.search]);

  // When tab changes in UI, update URL
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(location.search);
    params.set('tab', tab);
    navigate({ pathname: location.pathname, search: params.toString() });
  };

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

  useEffect(() => {
    if (activeTab === 'announcements') {
      setAnnouncementsLoading(true);
      setAnnouncementsError("");
      apiService.getAnnouncements()
        .then(data => setAnnouncements(data))
        .catch(err => setAnnouncementsError(err.message || 'Failed to fetch announcements'))
        .finally(() => setAnnouncementsLoading(false));
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'assignments') {
      setAssignmentsLoading(true);
      setAssignmentsError("");
      apiService.getAssignments()
        .then(data => setAssignments(data))
        .catch(err => setAssignmentsError(err.message || 'Failed to fetch assignments'))
        .finally(() => setAssignmentsLoading(false));
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'students') {
      setStudentsLoading(true);
      setStudentsError("");
      const fetchAllStudents = async () => {
        try {
          const all = {};
          for (const course of courses) {
            const students = await apiService.getCourseStudents(course.id);
            all[course.id] = students;
          }
          setCourseStudents(all);
        } catch (err) {
          setStudentsError(err.message || 'Failed to fetch students');
        } finally {
          setStudentsLoading(false);
        }
      };
      fetchAllStudents();
    }
  }, [activeTab, courses]);

  useEffect(() => {
    if (activeTab === 'earnings') {
      setEarningsLoading(true);
      setEarningsError("");
      apiService.getEarnings()
        .then(data => setEarnings(data))
        .catch(err => setEarningsError(err.message || 'Failed to fetch earnings'))
        .finally(() => setEarningsLoading(false));
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'settings') {
      setProfileLoading(true);
      setProfileError("");
      apiService.getProfile()
        .then(data => setProfile(data))
        .catch(err => setProfileError(err.message || 'Failed to fetch profile'))
        .finally(() => setProfileLoading(false));
    }
  }, [activeTab]);

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
          {userRole === 'instructor' ? (
            <>
              {/* Instructor Tab Navigation */}
              <div className="flex space-x-4 border-b mb-6 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'calendar', label: 'Calendar' },
                  { id: 'announcements', label: 'Announcements' },
                  { id: 'assignments', label: 'Assignments' },
                  { id: 'create', label: 'Create Course' },
                  { id: 'students', label: 'Students' },
                  { id: 'earnings', label: 'Earnings' },
                  { id: 'settings', label: 'Settings' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center px-4 py-2 ${activeTab === tab.id
                      ? 'border-b-2 border-emerald-500 text-emerald-600'
                      : 'text-gray-600'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {/* Instructor Tab Content */}
              <div className="mt-6">
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Courses */}
                      <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4 w-full text-left">
                        <span className="text-3xl text-emerald-500">📚</span>
                        <div>
                          <p className="text-gray-500">Courses</p>
                          <p className="text-2xl font-bold">{Array.isArray(courses) ? courses.length : 0}</p>
                        </div>
                      </div>
                      {/* Students */}
                      <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4 w-full text-left">
                        <span className="text-3xl text-emerald-500">👥</span>
                        <div>
                          <p className="text-gray-500">Students</p>
                          <p className="text-2xl font-bold">{stats?.students || 0}</p>
                        </div>
                      </div>
                      {/* Revenue */}
                      <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4 w-full text-left">
                        <span className="text-3xl text-emerald-500">💰</span>
                        <div>
                          <p className="text-gray-500">Revenue</p>
                          <p className="text-2xl font-bold">${stats?.revenue || 0}</p>
                        </div>
                      </div>
                      {/* Assignments */}
                      <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4 w-full text-left">
                        <span className="text-3xl text-emerald-500">📝</span>
                        <div>
                          <p className="text-gray-500">Assignments</p>
                          <p className="text-2xl font-bold">-</p>
                        </div>
                      </div>
                    </div>
                    {/* Earnings Chart Placeholder */}
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h2 className="text-xl font-semibold mb-4">Earnings Chart</h2>
                      <div className="h-48 flex items-center justify-center text-gray-400">[Earnings chart coming soon]</div>
                    </div>
                    {/* Recent Activity Feed Placeholder */}
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                      <ul className="space-y-2">
                        <li>No recent activity.</li>
                      </ul>
                    </div>
                    {/* Courses Preview */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6 border border-emerald-100">
                      <h2 className="text-xl font-bold text-emerald-700 mb-4">My Courses</h2>
                      {courses.length === 0 ? (
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
                                <span className="text-emerald-700 font-bold">{course.price ? `$${course.price}` : ''}</span>
                                <span className="text-xs text-gray-400">{course.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {activeTab === 'calendar' && (
                  <div className="bg-white p-6 rounded-lg shadow-lg border border-emerald-100">
                    <h2 className="text-2xl font-bold mb-6 flex items-center text-emerald-700">
                      Calendar
                    </h2>
                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Calendar */}
                      <div className="md:w-1/2">
                        <Calendar
                          onChange={setCalendarDate}
                          value={calendarDate}
                          tileContent={({ date: tileDate }) => {
                            const dayEvents = events.filter(
                              (event) => new Date(event.date).toDateString() === tileDate.toDateString()
                            );
                            return (
                              <ul className="text-xs text-emerald-500">
                                {dayEvents.map((ev, i) => (
                                  <li key={i}>📌</li>
                                ))}
                              </ul>
                            );
                          }}
                          className="rounded-lg shadow border border-emerald-200"
                          tileClassName={({ date: tileDate }) =>
                            calendarDate && new Date(calendarDate).toDateString() === tileDate.toDateString()
                              ? 'bg-emerald-200' // highlight selected date
                              : events.some(ev => new Date(ev.date).toDateString() === tileDate.toDateString())
                                ? 'bg-emerald-50'
                                : undefined
                          }
                        />
                      </div>
                      {/* Event Form & List */}
                      <div className="md:w-1/2 flex flex-col">
                        <div className="bg-emerald-50 p-4 rounded-lg shadow mb-6 border border-emerald-200">
                          <h3 className="font-semibold text-emerald-700 mb-2">
                            Selected Date: <span className="font-mono">{calendarDate.toDateString()}</span>
                          </h3>
                          <form
                            className="flex flex-col gap-2"
                            onSubmit={e => {
                              e.preventDefault();
                              const title = e.target.title.value.trim();
                              if (!title) return;
                              setEvents([...events, { id: Date.now(), date: calendarDate, title }]);
                              e.target.reset();
                            }}
                          >
                            <input
                              type="text"
                              name="title"
                              placeholder="Event title"
                              className="border border-emerald-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400"
                              required
                            />
                            <button
                              type="submit"
                              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded shadow hover:from-emerald-600 hover:to-emerald-800 transition"
                            >
                              Add Event
                            </button>
                          </form>
                        </div>
                        <div className="bg-white rounded-lg shadow border border-emerald-100 p-4 flex-1">
                          <h4 className="font-semibold text-emerald-700 mb-3">
                            Events on <span className="font-mono">{calendarDate.toDateString()}</span>
                          </h4>
                          <ul className="space-y-3">
                            {events
                              .filter(ev => new Date(ev.date).toDateString() === calendarDate.toDateString())
                              .map((event, i) => (
                                <li key={event.id} className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded px-3 py-2 shadow-sm">
                                  <span className="flex-1 text-emerald-800 font-medium">{event.title}</span>
                                  <button
                                    onClick={() => setEvents(events.filter(ev => ev.id !== event.id))}
                                    className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                    title="Delete"
                                  >
                                    Delete
                                  </button>
                                </li>
                              ))}
                            {events.filter(ev => new Date(ev.date).toDateString() === calendarDate.toDateString()).length === 0 && (
                              <li className="text-gray-400 italic">No events for this date.</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'announcements' && (
                  <div className="bg-white p-6 rounded-lg shadow border border-emerald-100">
                    <h2 className="text-xl font-bold text-emerald-700 mb-4">Announcements</h2>
                    {userRole === 'instructor' && (
                      <NotificationForm courses={courses} onSuccess={() => {}} />
                    )}
                    <form
                      className="flex gap-2 mb-4"
                      onSubmit={async e => {
                        e.preventDefault();
                        if (!announcementText.trim()) return;
                        try {
                          setAnnouncementsLoading(true);
                          setAnnouncementsError("");
                          const newAnnouncement = await apiService.createAnnouncement({ text: announcementText });
                          setAnnouncements([newAnnouncement, ...announcements]);
                          setAnnouncementText("");
                        } catch (err) {
                          setAnnouncementsError(err.message || 'Failed to post announcement');
                        } finally {
                          setAnnouncementsLoading(false);
                        }
                      }}
                    >
                      <input
                        className="flex-1 border border-emerald-300 rounded p-2"
                        value={announcementText}
                        onChange={e => setAnnouncementText(e.target.value)}
                        placeholder="Write an announcement..."
                        required
                      />
                      <button className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">Post</button>
                    </form>
                    {announcementsLoading && <div className="mb-2 text-blue-600">Loading...</div>}
                    {announcementsError && <div className="mb-2 text-red-600">{announcementsError}</div>}
                    <ul className="space-y-3">
                      {announcements.length === 0 && !announcementsLoading && <li className="text-gray-400">No announcements yet.</li>}
                      {announcements.map((a, i) => (
                        <li key={a.id || i} className="border p-3 rounded flex flex-col">
                          <span>{a.text}</span>
                          <span className="text-xs text-gray-400">{a.date ? new Date(a.date).toLocaleString() : ''}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {activeTab === 'assignments' && (
                  <div className="bg-white p-6 rounded-lg shadow border border-emerald-100">
                    <h2 className="text-xl font-bold text-emerald-700 mb-4">Assignments</h2>
                    <form
                      className="mb-6 flex flex-col gap-2"
                      onSubmit={async e => {
                        e.preventDefault();
                        if (!assignmentForm.title.trim() || !assignmentForm.description.trim()) return;
                        try {
                          setAssignmentsLoading(true);
                          setAssignmentsError("");
                          const newAssignment = await apiService.createAssignment({ title: assignmentForm.title, description: assignmentForm.description });
                          setAssignments([newAssignment, ...assignments]);
                          setAssignmentForm({ title: "", description: "" });
                        } catch (err) {
                          setAssignmentsError(err.message || 'Failed to post assignment');
                        } finally {
                          setAssignmentsLoading(false);
                        }
                      }}
                    >
                      <input
                        className="border border-emerald-300 rounded p-2"
                        value={assignmentForm.title}
                        onChange={e => setAssignmentForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="Assignment Title"
                        required
                      />
                      <textarea
                        className="border border-emerald-300 rounded p-2"
                        value={assignmentForm.description}
                        onChange={e => setAssignmentForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Assignment Description"
                        required
                      />
                      <button className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">Post Assignment</button>
                    </form>
                    {assignmentsLoading && <div className="mb-2 text-blue-600">Loading...</div>}
                    {assignmentsError && <div className="mb-2 text-red-600">{assignmentsError}</div>}
                    <ul className="space-y-3">
                      {assignments.length === 0 && !assignmentsLoading && <li className="text-gray-400">No assignments yet.</li>}
                      {assignments.map((a, i) => (
                        <li key={a.id || i} className="border p-3 rounded flex flex-col">
                          <span className="font-semibold">{a.title}</span>
                          <span>{a.description}</span>
                          <span className="text-xs text-gray-400">{a.date ? new Date(a.date).toLocaleString() : ''}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {activeTab === 'create' && (
                  <div className="bg-white p-6 rounded-lg shadow border border-emerald-100 max-w-2xl mx-auto">
                    <h2 className="text-xl font-bold text-emerald-700 mb-4">Create Course</h2>
                    {createLoading && <div className="mb-2 text-blue-600">Creating course...</div>}
                    {createError && <div className="mb-2 text-red-600">{createError}</div>}
                    {createMsg && <div className="mb-4 text-green-600 font-semibold">{createMsg}</div>}
                    <form
                      className="flex flex-col gap-4"
                      onSubmit={async e => {
                        e.preventDefault();
                        setCreateLoading(true);
                        setCreateError('');
                        setCreateMsg('');
                        try {
                          // Prepare course data
                          const courseData = new FormData();
                          courseData.append('title', courseForm.title);
                          courseData.append('description', courseForm.description);
                          courseData.append('price', courseForm.price);
                          courseData.append('difficulty', courseForm.difficulty);
                          courseData.append('requirements', JSON.stringify(courseForm.requirements.filter(r => r.trim())));
                          courseData.append('outcomes', JSON.stringify(courseForm.outcomes.filter(o => o.trim())));
                          if (courseForm.thumbnail) courseData.append('thumbnail', courseForm.thumbnail);
                          // Create course
                          const course = await apiService.createCourse(courseData);
                          // Create modules and lessons
                          for (const [modIdx, module] of modules.entries()) {
                            const moduleRes = await apiService.createModule({
                              title: module.title,
                              course: course.id,
                              order: modIdx + 1
                            });
                            for (const [lesIdx, lesson] of module.lessons.entries()) {
                              await apiService.createLesson({
                                title: lesson.title,
                                content: lesson.content || '',
                                lesson_type: lesson.lesson_type || 'video',
                                module: moduleRes.id,
                                order: lesIdx + 1,
                                video_url: lesson.video_url || '',
                              });
                            }
                          }
                          setCreateMsg('Course created successfully!');
                          setCourseForm({ title: '', description: '', price: 0, requirements: [''], outcomes: [''], difficulty: 'beginner', thumbnail: null });
                          setModules([]);
                        } catch (err) {
                          setCreateError(err.message || 'Failed to create course');
                        } finally {
                          setCreateLoading(false);
                          setTimeout(() => setCreateMsg(''), 3000);
                        }
                      }}
                    >
                      <input className="border rounded p-2" value={courseForm.title} onChange={e => setCourseForm(f => ({ ...f, title: e.target.value }))} placeholder="Course Title" required />
                      <textarea className="border rounded p-2" value={courseForm.description} onChange={e => setCourseForm(f => ({ ...f, description: e.target.value }))} placeholder="Course Description" required />
                      <input className="border rounded p-2" type="number" min="0" value={courseForm.price} onChange={e => setCourseForm(f => ({ ...f, price: e.target.value }))} placeholder="Price (USD)" />
                      <select className="border rounded p-2" value={courseForm.difficulty} onChange={e => setCourseForm(f => ({ ...f, difficulty: e.target.value }))} required>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                      <div>
                        <label className="block font-semibold mb-1">Requirements</label>
                        {courseForm.requirements.map((req, i) => (
                          <div key={i} className="flex gap-2 mb-1">
                            <input className="border rounded p-2 flex-1" value={req} onChange={e => setCourseForm(f => ({ ...f, requirements: f.requirements.map((r, j) => j === i ? e.target.value : r) }))} placeholder={`Requirement ${i + 1}`} />
                            <button type="button" className="text-red-500" onClick={() => setCourseForm(f => ({ ...f, requirements: f.requirements.filter((_, j) => j !== i) }))}>Remove</button>
                          </div>
                        ))}
                        <button type="button" className="text-emerald-600 mt-1" onClick={() => setCourseForm(f => ({ ...f, requirements: [...f.requirements, ''] }))}>Add Requirement</button>
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Outcomes</label>
                        {courseForm.outcomes.map((out, i) => (
                          <div key={i} className="flex gap-2 mb-1">
                            <input className="border rounded p-2 flex-1" value={out} onChange={e => setCourseForm(f => ({ ...f, outcomes: f.outcomes.map((o, j) => j === i ? e.target.value : o) }))} placeholder={`Outcome ${i + 1}`} />
                            <button type="button" className="text-red-500" onClick={() => setCourseForm(f => ({ ...f, outcomes: f.outcomes.filter((_, j) => j !== i) }))}>Remove</button>
                          </div>
                        ))}
                        <button type="button" className="text-emerald-600 mt-1" onClick={() => setCourseForm(f => ({ ...f, outcomes: [...f.outcomes, ''] }))}>Add Outcome</button>
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Thumbnail</label>
                        <input className="border rounded p-2" type="file" accept="image/*" onChange={e => setCourseForm(f => ({ ...f, thumbnail: e.target.files[0] }))} />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Modules & Lessons</label>
                        {modules.map((mod, modIdx) => (
                          <div key={modIdx} className="border rounded p-2 mb-2">
                            <div className="flex gap-2 mb-1">
                              <input className="border rounded p-2 flex-1" value={mod.title} onChange={e => setModules(ms => ms.map((m, i) => i === modIdx ? { ...m, title: e.target.value } : m))} placeholder={`Module ${modIdx + 1} Title`} required />
                              <button type="button" className="text-red-500" onClick={() => setModules(ms => ms.filter((_, i) => i !== modIdx))}>Remove Module</button>
                            </div>
                            <div className="ml-4">
                              {mod.lessons.map((les, lesIdx) => (
                                <div key={lesIdx} className="flex gap-2 mb-1">
                                  <input className="border rounded p-2 flex-1" value={les.title} onChange={e => setModules(ms => ms.map((m, i) => i === modIdx ? { ...m, lessons: m.lessons.map((l, j) => j === lesIdx ? { ...l, title: e.target.value } : l) } : m))} placeholder={`Lesson ${lesIdx + 1} Title`} required />
                                  <input className="border rounded p-2 flex-1" value={les.video_url || ''} onChange={e => setModules(ms => ms.map((m, i) => i === modIdx ? { ...m, lessons: m.lessons.map((l, j) => j === lesIdx ? { ...l, video_url: e.target.value } : l) } : m))} placeholder={`Lesson ${lesIdx + 1} Video URL`} />
                                  <button type="button" className="text-red-500" onClick={() => setModules(ms => ms.map((m, i) => i === modIdx ? { ...m, lessons: m.lessons.filter((_, j) => j !== lesIdx) } : m))}>Remove Lesson</button>
                                </div>
                              ))}
                              <button type="button" className="text-emerald-600 mt-1" onClick={() => setModules(ms => ms.map((m, i) => i === modIdx ? { ...m, lessons: [...m.lessons, { title: '', video_url: '' }] } : m))}>Add Lesson</button>
                            </div>
                          </div>
                        ))}
                        <button type="button" className="text-emerald-600 mt-1" onClick={() => setModules(ms => [...ms, { title: '', lessons: [{ title: '', video_url: '' }] }])}>Add Module</button>
                      </div>
                      <button className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">Create Course</button>
                    </form>
                  </div>
                )}
                {activeTab === 'students' && (
                  <div className="bg-white p-6 rounded-lg shadow border border-emerald-100">
                    <h2 className="text-xl font-bold text-emerald-700 mb-4">Enrolled Students by Course</h2>
                    {studentsLoading && <div className="mb-2 text-blue-600">Loading...</div>}
                    {studentsError && <div className="mb-2 text-red-600">{studentsError}</div>}
                    {courses.length === 0 && !studentsLoading ? (
                      <div className="text-gray-500 text-center py-8">No courses yet!</div>
                    ) : (
                      courses.map((course) => (
                        <div key={course.id} className="bg-emerald-50 rounded-lg shadow p-4 mb-4 border border-emerald-100">
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
                      ))
                    )}
                  </div>
                )}
                {activeTab === 'earnings' && (
                  <div className="bg-white p-6 rounded-lg shadow border border-emerald-100">
                    <h2 className="text-xl font-bold text-emerald-700 mb-4">Earnings</h2>
                    {earningsLoading && <div className="mb-2 text-blue-600">Loading...</div>}
                    {earningsError && <div className="mb-2 text-red-600">{earningsError}</div>}
                    {earnings && earnings.length > 0 ? (
                      <>
                        <div className="text-2xl font-bold mb-4">Total: ${earnings.reduce((sum, p) => sum + (p.amount || 0), 0)}</div>
                        <ul className="space-y-2">
                          {earnings.map((p, i) => (
                            <li key={p.id || i} className="border p-3 rounded flex flex-col">
                              <span>Student: {p.student_name || p.student || 'N/A'}</span>
                              <span>Amount: ${p.amount}</span>
                              <span className="text-xs text-gray-400">{p.date ? new Date(p.date).toLocaleString() : ''}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : !earningsLoading ? (
                      <div className="text-gray-500 text-center py-8">No earnings yet.</div>
                    ) : null}
                  </div>
                )}
                {activeTab === 'settings' && (
                  <div className="bg-white p-6 rounded-lg shadow border border-emerald-100 max-w-md">
                    <h2 className="text-xl font-bold text-emerald-700 mb-4">Profile & Settings</h2>
                    {profileLoading && <div className="mb-2 text-blue-600">Loading...</div>}
                    {profileError && <div className="mb-2 text-red-600">{profileError}</div>}
                    {profile && (
                      <div className="mb-4">
                        <p><span className="font-semibold">Username:</span> {profile.username}</p>
                        <p><span className="font-semibold">Email:</span> {profile.email}</p>
                      </div>
                    )}
                    <h3 className="text-lg font-semibold mb-2">Change Password</h3>
                    <form
                      className="flex flex-col gap-2"
                      onSubmit={async e => {
                        e.preventDefault();
                        setPwLoading(true);
                        setPwError("");
                        setPwSuccess("");
                        if (pwForm.new1 !== pwForm.new2) {
                          setPwError("New passwords do not match.");
                          setPwLoading(false);
                          return;
                        }
                        try {
                          await api.post('/api/change-password/', {
                            old_password: pwForm.old,
                            new_password: pwForm.new1,
                          });
                          setPwSuccess("Password changed successfully!");
                          setPwForm({ old: "", new1: "", new2: "" });
                        } catch (err) {
                          setPwError("Failed to change password.");
                        } finally {
                          setPwLoading(false);
                        }
                      }}
                    >
                      <input
                        className="border border-emerald-300 rounded p-2"
                        type="password"
                        placeholder="Current Password"
                        value={pwForm.old}
                        onChange={e => setPwForm(f => ({ ...f, old: e.target.value }))}
                        required
                      />
                      <input
                        className="border border-emerald-300 rounded p-2"
                        type="password"
                        placeholder="New Password"
                        value={pwForm.new1}
                        onChange={e => setPwForm(f => ({ ...f, new1: e.target.value }))}
                        required
                      />
                      <input
                        className="border border-emerald-300 rounded p-2"
                        type="password"
                        placeholder="Confirm New Password"
                        value={pwForm.new2}
                        onChange={e => setPwForm(f => ({ ...f, new2: e.target.value }))}
                        required
                      />
                      <button className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700" disabled={pwLoading}>Change Password</button>
                      {pwLoading && <div className="text-blue-600 mt-2">Changing password...</div>}
                      {pwError && <div className="text-red-600 mt-2">{pwError}</div>}
                      {pwSuccess && <div className="text-emerald-600 mt-2">{pwSuccess}</div>}
                    </form>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Student dashboard as before
            <>
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
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;

