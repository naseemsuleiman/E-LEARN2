import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  AcademicCapIcon, 
  DocumentArrowDownIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline';

export default function Certificates() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await api.get('/certificates/');
      setCertificates(response.data);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async (certificateId) => {
    try {
      const response = await api.get(`/certificates/${certificateId}/download/`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Error downloading certificate. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <AcademicCapIcon className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">My Certificates</h1>
          </div>
          <p className="text-gray-600">
            View and download your course completion certificates
          </p>
        </div>

        {certificates.length === 0 ? (
          <div className="text-center py-12">
            <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h3>
            <p className="text-gray-600 mb-6">
              Complete courses to earn certificates and showcase your achievements.
            </p>
            <a
              href="/courses"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Browse Courses
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map(certificate => (
              <div key={certificate.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Certificate Header */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <AcademicCapIcon className="h-8 w-8" />
                    <div className="text-right">
                      <div className="text-sm opacity-90">Certificate ID</div>
                      <div className="font-mono text-xs">{certificate.id}</div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{certificate.course.title}</h3>
                  <p className="text-sm opacity-90">{certificate.course.instructor_name}</p>
                </div>

                {/* Certificate Details */}
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Completion Date</span>
                      <span className="text-sm font-medium">
                        {formatDate(certificate.completion_date)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Grade</span>
                      <span className="text-sm font-medium text-green-600">
                        {certificate.grade}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Duration</span>
                      <span className="text-sm font-medium">
                        {certificate.course.duration || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Certificate Status */}
                  <div className="flex items-center space-x-2 mb-4">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600">
                      Course Completed Successfully
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedCertificate(certificate)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleDownloadCertificate(certificate.id)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certificate Preview Modal */}
        {selectedCertificate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Certificate Preview</h2>
                  <button
                    onClick={() => setSelectedCertificate(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Certificate Design */}
                <div className="border-4 border-purple-600 rounded-lg p-8 bg-gradient-to-br from-purple-50 to-white">
                  <div className="text-center">
                    {/* Header */}
                    <div className="mb-8">
                      <AcademicCapIcon className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                      <h1 className="text-3xl font-bold text-purple-800 mb-2">Certificate of Completion</h1>
                      <p className="text-gray-600">This is to certify that</p>
                    </div>

                    {/* Student Name */}
                    <div className="mb-8">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        {user?.username || 'Student Name'}
                      </h2>
                      <p className="text-gray-600">has successfully completed the course</p>
                    </div>

                    {/* Course Details */}
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-purple-700 mb-2">
                        {selectedCertificate.course.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        instructed by {selectedCertificate.course.instructor_name}
                      </p>
                      <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          <span>Completed on {formatDate(selectedCertificate.completion_date)}</span>
                        </div>
                        <div className="flex items-center">
                          <StarIcon className="h-4 w-4 mr-1" />
                          <span>Grade: {selectedCertificate.grade}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-300 pt-6">
                      <div className="grid grid-cols-2 gap-8">
                        <div className="text-center">
                          <div className="h-16 border-b-2 border-gray-300 mb-2"></div>
                          <p className="text-sm text-gray-600">Instructor Signature</p>
                        </div>
                        <div className="text-center">
                          <div className="h-16 border-b-2 border-gray-300 mb-2"></div>
                          <p className="text-sm text-gray-600">Date</p>
                        </div>
                      </div>
                    </div>

                    {/* Certificate ID */}
                    <div className="mt-6 text-xs text-gray-500">
                      Certificate ID: {selectedCertificate.id}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => handleDownloadCertificate(selectedCertificate.id)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={() => setSelectedCertificate(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 