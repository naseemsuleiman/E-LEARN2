import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  MapIcon, 
  PlayIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  StarIcon,
  ArrowRightIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

export default function LearningPaths() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [learningPaths, setLearningPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPath, setSelectedPath] = useState(null);

  useEffect(() => {
    fetchLearningPaths();
  }, []);

  const fetchLearningPaths = async () => {
    try {
      const response = await api.get('/api/learning-paths/');
      setLearningPaths(response.data);
    } catch (error) {
      console.error('Error fetching learning paths:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollInPath = async (pathId) => {
    try {
      await api.post(`/learning-paths/${pathId}/enroll/`);
      // Refresh learning paths to update enrollment status
      fetchLearningPaths();
      alert('Successfully enrolled in learning path!');
    } catch (error) {
      console.error('Error enrolling in learning path:', error);
      alert('Error enrolling in learning path. Please try again.');
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getProgressPercentage = (path) => {
    if (!path.courses || path.courses.length === 0) return 0;
    const completedCourses = path.courses.filter(course => course.completed).length;
    return Math.round((completedCourses / path.courses.length) * 100);
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
            <MapIcon className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Learning Paths</h1>
          </div>
          <p className="text-gray-600">
            Follow structured learning paths to master new skills and advance your career
          </p>
        </div>

        {learningPaths.length === 0 ? (
          <div className="text-center py-12">
            <MapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No learning paths available</h3>
            <p className="text-gray-600 mb-6">
              Check back later for curated learning paths.
            </p>
            <a
              href="/courses"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Browse Individual Courses
            </a>
          </div>
        ) : (
          <div className="space-y-8">
            {learningPaths.map(path => {
              const progressPercentage = getProgressPercentage(path);
              const isEnrolled = path.is_enrolled;
              
              return (
                <div key={path.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h2 className="text-2xl font-bold text-gray-900">{path.title}</h2>
                          {path.is_featured && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-4">{path.description}</p>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            <span>{formatDuration(path.total_duration)}</span>
                          </div>
                          <div className="flex items-center">
                            <BookOpenIcon className="h-4 w-4 mr-1" />
                            <span>{path.courses?.length || 0} courses</span>
                          </div>
                          <div className="flex items-center">
                            <UserIcon className="h-4 w-4 mr-1" />
                            <span>{path.enrolled_students} students</span>
                          </div>
                          <div className="flex items-center">
                            <StarIcon className="h-4 w-4 mr-1" />
                            <span>{path.difficulty}</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {isEnrolled && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium">{progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Skills Covered */}
                        {path.skills && path.skills.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Skills You'll Learn</h4>
                            <div className="flex flex-wrap gap-2">
                              {path.skills.map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end space-y-3">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            ${path.price}
                          </div>
                          {path.original_price && path.original_price > path.price && (
                            <div className="text-sm text-gray-500 line-through">
                              ${path.original_price}
                            </div>
                          )}
                        </div>
                        
                        {isEnrolled ? (
                          <button
                            onClick={() => setSelectedPath(path)}
                            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                          >
                            <PlayIcon className="h-4 w-4" />
                            <span>Continue Learning</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEnrollInPath(path.id)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                          >
                            Enroll Now
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Course List */}
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Courses in this Path</h4>
                      <div className="space-y-3">
                        {path.courses?.map((course, index) => (
                          <div key={course.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-purple-600">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{course.title}</h5>
                              <p className="text-sm text-gray-600">{course.instructor_name}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {course.completed && (
                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                              )}
                              <span className="text-sm text-gray-500">
                                {formatDuration(course.duration)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Learning Path Detail Modal */}
        {selectedPath && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedPath.title}</h2>
                  <button
                    onClick={() => setSelectedPath(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <p className="text-gray-600">{selectedPath.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Path Overview</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Duration:</span>
                          <span>{formatDuration(selectedPath.total_duration)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Number of Courses:</span>
                          <span>{selectedPath.courses?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Difficulty Level:</span>
                          <span>{selectedPath.difficulty}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Enrolled Students:</span>
                          <span>{selectedPath.enrolled_students}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Your Progress</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Completed Courses:</span>
                          <span>{selectedPath.courses?.filter(c => c.completed).length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Remaining Courses:</span>
                          <span>{selectedPath.courses?.filter(c => !c.completed).length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Overall Progress:</span>
                          <span>{getProgressPercentage(selectedPath)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Course Sequence</h4>
                    <div className="space-y-3">
                      {selectedPath.courses?.map((course, index) => (
                        <div key={course.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                          <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-purple-600">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{course.title}</h5>
                            <p className="text-sm text-gray-600">{course.instructor_name}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            {course.completed && (
                              <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            )}
                            <button
                              onClick={() => {
                                setSelectedPath(null);
                                navigate(`/courses/${course.id}`);
                              }}
                              className="flex items-center space-x-1 text-purple-600 hover:text-purple-700"
                            >
                              <span>View Course</span>
                              <ArrowRightIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 