import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ModuleList from '../components/ModuleList';
import AssignmentList from '../components/AssignmentList';
import AnnouncementList from '../components/AnnouncementList';
import StudentList from '../components/StudentList';
import Discussion from '../components/Discussion';

const TABS = [
  { key: 'modules', label: 'Modules' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'announcements', label: 'Announcements' },
  { key: 'discussion', label: 'Discussion' },
  { key: 'students', label: 'Enrolled Students' },
];

const CourseDetail = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('modules');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${courseId}/`);
        setCourse(res.data);
      } catch {
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!course) return <div className="text-center py-10 text-red-500">Course not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
      <p className="mb-4 text-gray-700">{course.description}</p>
      <div className="flex space-x-4 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded ${activeTab === tab.key ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {activeTab === 'modules' && <ModuleList courseId={courseId} />}
        {activeTab === 'assignments' && <AssignmentList courseId={courseId} showSubmissionForm={true} />}
        {activeTab === 'announcements' && <AnnouncementList courseId={courseId} />}
        {activeTab === 'discussion' && <Discussion courseId={courseId} />}
        {activeTab === 'students' && <StudentList courseId={courseId} />}
      </div>
    </div>
  );
};

export default CourseDetail;
