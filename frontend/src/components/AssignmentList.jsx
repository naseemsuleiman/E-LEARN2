import React, { useEffect, useState } from 'react';
import apiService, { api } from '../services/api';
import SubmissionList from './SubmissionList';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dialog } from '@headlessui/react';
import { ExclamationCircleIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { useParams } from 'react-router-dom';

const AssignmentList = ({  showSubmissionForm }) => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [success, setSuccess] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(null);
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    due_date: '',
    max_points: 100,
    pdf: null,
  });
  const [uploadErrors, setUploadErrors] = useState({});
  const [highlightedId, setHighlightedId] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await api.get(`/api/assignments/?course=${courseId}`);
        setAssignments(res.data);
      } catch {
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    await api.post(`/api/assignments/${selectedAssignment}/submissions/`, { text: submissionText });
    setSuccess(true);
    setSubmissionText('');
    setTimeout(() => setSuccess(false), 2000);
    // Show toast if available
    if (window.showToast) window.showToast('Submission successful!', 'success');
  };

  const validateUpload = () => {
    const errors = {};
    if (!newAssignment.title.trim()) errors.title = 'Title is required.';
    if (!newAssignment.description.trim()) errors.description = 'Description is required.';
    if (!newAssignment.due_date) errors.due_date = 'Due date is required.';
    if (!newAssignment.max_points || newAssignment.max_points < 1) errors.max_points = 'Max points must be at least 1.';
    if (!newAssignment.pdf) errors.pdf = 'PDF file is required.';
    else if (newAssignment.pdf.type !== 'application/pdf') errors.pdf = 'Only PDF files are allowed.';
    else if (newAssignment.pdf.size > 10 * 1024 * 1024) errors.pdf = 'File size must be under 10MB.';
    return errors;
  };

  const handleUploadChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'pdf') {
      setNewAssignment((prev) => ({ ...prev, pdf: files[0] }));
    } else {
      setNewAssignment((prev) => ({ ...prev, [name]: value }));
    }
    setUploadErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleUploadAssignment = async (e) => {
    e.preventDefault();
    const errors = validateUpload();
    setUploadErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', newAssignment.title);
      formData.append('description', newAssignment.description);
      formData.append('due_date', newAssignment.due_date);
      formData.append('max_points', newAssignment.max_points);
      formData.append('course', courseId);
      if (newAssignment.pdf) {
        formData.append('pdf', newAssignment.pdf);
      }
      const created = await apiService.createAssignment(formData);
      setShowUploadForm(false);
      setNewAssignment({ title: '', description: '', due_date: '', max_points: 100, pdf: null });
      // Refresh assignments
      const res = await api.get(`/api/assignments/?course=${courseId}`);
      setAssignments(res.data);
      setHighlightedId(created.id);
      if (window.showToast) window.showToast('Assignment created!', 'success');
    } catch (err) {
      if (window.showToast) window.showToast('Failed to create assignment.', 'error');
      else alert('Failed to create assignment.');
    } finally {
      setUploading(false);
    }
  };

  

  if (loading) return <div>Loading assignments...</div>;
  if (!assignments.length) return <div>No assignments found.</div>;

  const getDueStatus = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  const diff = (due - now) / (1000 * 60 * 60 * 24);
  if (diff < 0) return 'overdue';
  if (diff < 3) return 'due-soon';
  return 'on-track';
};

  return (
    <div className="mb-6">
      {/* Instructor Upload Form */}
      {user?.role === 'instructor' && (
        <div className="mb-6 bg-white p-4 rounded shadow">
          {!showUploadForm ? (
            <button
              className="bg-emerald-600 text-white px-4 py-2 rounded mb-2"
              onClick={() => setShowUploadForm(true)}
            >
              + Upload Assignment
            </button>
          ) : (
            <form onSubmit={handleUploadAssignment} className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Title</label>
                <input
                  type="text"
                  name="title"
                  value={newAssignment.title}
                  onChange={handleUploadChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  value={newAssignment.description}
                  onChange={handleUploadChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Due Date</label>
                <input
                  type="date"
                  name="due_date"
                  value={newAssignment.due_date}
                  onChange={handleUploadChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Max Points</label>
                <input
                  type="number"
                  name="max_points"
                  value={newAssignment.max_points}
                  onChange={handleUploadChange}
                  className="w-full p-2 border rounded"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">PDF File</label>
                <input
                  type="file"
                  name="pdf"
                  accept="application/pdf"
                  onChange={handleUploadChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-emerald-600 text-white px-4 py-2 rounded"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Create Assignment'}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded"
                  onClick={() => setShowUploadForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
      <h2 className="text-xl font-semibold mb-2">Assignments</h2>
      <ul className="space-y-2">
        {assignments.map((a) => (
          <li key={a.id} className="bg-gray-100 rounded p-2 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-bold">{a.title}</div>
              <div className="text-gray-600">Due: {a.due_date}</div>
            </div>
            <div className="flex space-x-2 mt-2 md:mt-0">
              {showSubmissionForm && (
                <button
                  className="bg-purple-600 text-white px-3 py-1 rounded"
                  onClick={() => setSelectedAssignment(a.id)}
                >
                  Submit
                </button>
              )}
              {!showSubmissionForm && (
                <button
                
                  className="bg-green-600 text-white px-3 py-1 rounded"
                  onClick={() => setShowSubmissions(a.id)}
                >
                  
                  View Submissions
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {showSubmissionForm && selectedAssignment && (
        <form onSubmit={handleSubmit} className="mt-4 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Submit Assignment</h3>
          <textarea
            value={submissionText}
            onChange={e => setSubmissionText(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            placeholder="Enter your answer or notes..."
            required
          />
          <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">Submit</button>
          {success && <div className="text-green-600 mt-2">Submission successful!</div>}
        </form>
      )}
      {!showSubmissionForm && showSubmissions && (
        <SubmissionList assignmentId={showSubmissions} />
      )}
    </div>
  );
}

export default AssignmentList;
