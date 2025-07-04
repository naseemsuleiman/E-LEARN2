import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { apiService } from '../services/api';
import { 
  PlayIcon, 
  ClockIcon, 
  UserIcon, 
  StarIcon, 
  BookOpenIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  AcademicCapIcon,
  LightBulbIcon,
  ChartBarIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  UsersIcon,
  BellIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAIQuiz, setShowAIQuiz] = useState(false);
  const [aiQuizQuestions, setAiQuizQuestions] = useState([]);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const [modules, setModules] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollError, setEnrollError] = useState('');

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BookOpenIcon },
    { key: 'lessons', label: 'Lessons', icon: PlayIcon },
    { key: 'progress', label: 'Progress', icon: ChartBarIcon },
    { key: 'ai-quiz', label: 'AI Quiz', icon: LightBulbIcon },
    { key: 'discussion', label: 'Discussion', icon: ChatBubbleLeftIcon },
    { key: 'assignments', label: 'Assignments', icon: DocumentTextIcon },
    { key: 'students', label: 'Students', icon: UsersIcon },
  ];

  useEffect(() => {
    fetchCourseData();
    fetchModules();
    // Check if user is enrolled using backend
    const checkEnrollment = async () => {
      if (user && user.role !== 'instructor') {
        try {
          const enrolled = await apiService.isEnrolledInCourse(id);
          setEnrolled(enrolled);
        } catch (e) {
          setEnrolled(false);
        }
      } else if (user && user.role === 'instructor' && course && course.instructor === user.id) {
        setEnrolled(true);
      } else {
        setEnrolled(false);
      }
    };
    checkEnrollment();
  }, [id, user, course]);

  const fetchCourseData = async () => {
    try {
      const [courseRes, lessonsRes, progressRes] = await Promise.all([
        api.get(`/api/courses/${id}/`),
        api.get(`/api/courses/${id}/lessons/`),
        api.get(`/api/courses/${id}/progress/`)
      ]);
      
      setCourse(courseRes.data);
      setLessons(lessonsRes.data || []);
      setProgress(progressRes.data || {});
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const res = await api.get(`/api/modules/?course=${id}`);
      setModules(res.data);
    } catch (e) {
      setModules([]);
    }
  };

  const generateAIQuiz = async () => {
    try {
      const response = await api.post(`/api/courses/${id}/ai-quiz/`, {
        course_title: course.title,
        course_description: course.description
      });
      setAiQuizQuestions(response.data.questions);
      setShowAIQuiz(true);
      setCurrentQuizQuestion(0);
      setQuizAnswers({});
      setQuizScore(null);
    } catch (error) {
      console.error('Error generating AI quiz:', error);
      alert('Error generating AI quiz. Please try again.');
    }
  };

  const submitQuizAnswer = (questionIndex, answer) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const submitQuiz = async () => {
    try {
      const response = await api.post(`/api/courses/${id}/ai-quiz/submit/`, {
        answers: quizAnswers,
        questions: aiQuizQuestions
      });
      setQuizScore(response.data.score);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const getProgressPercentage = () => {
    if (!lessons.length) return 0;
    const completedLessons = lessons.filter(lesson => 
      progress[lesson.id]?.completed
    ).length;
    return Math.round((completedLessons / lessons.length) * 100);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const isLessonCompleted = (lessonId) => {
    return progress[lessonId]?.completed || false;
  };

  const handleFileChange = (e) => {
    setThumbnail(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', course.title);
    formData.append('thumbnail', thumbnail);

    await api.post('/api/courses/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    setEnrollError('');
    try {
      await apiService.enrollInCourse(id);
      setEnrolled(true);
    } catch (e) {
      setEnrollError(e.message);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
          <p className="text-gray-600">The course you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <span className="px-3 py-1 bg-emerald-500 rounded-full text-sm">
                  {course.category?.name || 'General'}
                </span>
                <span className="px-3 py-1 bg-emerald-500 rounded-full text-sm">
                  {course.difficulty}
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-emerald-100 mb-6">{course.short_description}</p>
              
              <div className="flex items-center space-x-6 text-emerald-100 mb-6">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  <span>{course.instructor_name}</span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  <span>{formatDuration(course.duration || 0)}</span>
                </div>
                <div className="flex items-center">
                  <BookOpenIcon className="h-5 w-5 mr-2" />
                  <span>{lessons.length} lessons</span>
                </div>
                <div className="flex items-center">
                  <StarIcon className="h-5 w-5 mr-2" />
                  <span>{course.rating || 4.5} ({course.reviews_count || 0} reviews)</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => navigate(`/courses/${id}/learn`)}
                  className="flex items-center space-x-2 px-6 py-3 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
                >
                  <PlayIcon className="h-5 w-5" />
                  <span>Start Learning</span>
                </button>
                {user?.role === 'instructor' && course.instructor === user?.id && (
                  <button
                    onClick={() => navigate(`/courses/${id}/edit`)}
                    className="flex items-center space-x-2 px-6 py-3 border border-white text-white rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
                  >
                    <CogIcon className="h-5 w-5" />
                    <span>Edit Course</span>
                  </button>
                )}
              </div>
            </div>

            {/* Course Card */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  ${course.price}
                </div>
                {course.original_price && course.original_price > course.price && (
                  <div className="text-lg text-gray-500 line-through">
                    ${course.original_price}
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-semibold">{getProgressPercentage()}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
              </div>

              {/* Enroll button for students */}
              {user && user.role !== 'instructor' && !enrolled && (
                <button
                  onClick={handleEnroll}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  disabled={enrolling}
                >
                  {enrolling ? 'Enrolling...' : 'Enroll in Course'}
                </button>
              )}
              {enrollError && <div className="text-red-500 mt-2 text-center">{enrollError}</div>}
              {enrolled && (
                <button
                  className="w-full bg-gray-300 text-gray-600 py-3 rounded-lg font-semibold cursor-not-allowed mt-2"
                  disabled
                >
                  Enrolled
                </button>
              )}

              <button
                onClick={() => navigate(`/courses/${id}/learn`)}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors mt-4"
              >
                Continue Learning
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        {enrolled ? (
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.key
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">About This Course</h3>
                    <p className="text-gray-700 leading-relaxed">{course.description}</p>
                  </div>

                  {course.requirements && course.requirements.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
                      <ul className="space-y-2">
                        {course.requirements.map((req, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {course.learning_outcomes && course.learning_outcomes.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">What You'll Learn</h3>
                      <ul className="space-y-2">
                        {course.learning_outcomes.map((outcome, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Lessons Tab */}
              {activeTab === 'lessons' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Course Content</h3>
                    <div className="text-sm text-gray-500">
                      {lessons.filter(l => isLessonCompleted(l.id)).length} of {lessons.length} lessons completed
                    </div>
                  </div>
                  {modules.length > 0 ? (
                    <div className="space-y-6">
                      {modules.map((mod, mIdx) => (
                        <div key={mod.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="mb-2">
                            <h4 className="text-md font-bold text-purple-700">{mod.title}</h4>
                            {mod.description && <div className="text-gray-600 text-sm mb-2">{mod.description}</div>}
                          </div>
                          <div className="space-y-2">
                            {lessons.filter(l => l.module === mod.id).length === 0 && (
                              <div className="text-gray-400 italic">No lessons in this module.</div>
                            )}
                            {lessons.filter(l => l.module === mod.id).map((lesson, index) => (
                              <div
                                key={lesson.id}
                                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                onClick={() => navigate(`/courses/${id}/learn?lesson=${lesson.id}`)}
                              >
                                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full mr-4">
                                  {isLessonCompleted(lesson.id) ? (
                                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <span className="text-sm font-medium text-purple-600">{index + 1}</span>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                                  <p className="text-sm text-gray-500">{lesson.description}</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                  <span className="text-sm text-gray-500">
                                    {formatDuration(lesson.duration || 0)}
                                  </span>
                                  <ArrowRightIcon className="h-5 w-5 text-gray-400" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {lessons.map((lesson, index) => (
                        <div
                          key={lesson.id}
                          className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/courses/${id}/learn?lesson=${lesson.id}`)}
                        >
                          <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full mr-4">
                            {isLessonCompleted(lesson.id) ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            ) : (
                              <span className="text-sm font-medium text-purple-600">{index + 1}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                            <p className="text-sm text-gray-500">{lesson.description}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">
                              {formatDuration(lesson.duration || 0)}
                            </span>
                            <ArrowRightIcon className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Progress Tab */}
              {activeTab === 'progress' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-purple-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <ChartBarIcon className="h-8 w-8 text-purple-600 mr-3" />
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{getProgressPercentage()}%</div>
                          <div className="text-sm text-gray-600">Overall Progress</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {lessons.filter(l => isLessonCompleted(l.id)).length}
                          </div>
                          <div className="text-sm text-gray-600">Lessons Completed</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <ClockIcon className="h-8 w-8 text-blue-600 mr-3" />
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {formatDuration(lessons.reduce((total, lesson) => 
                              isLessonCompleted(lesson.id) ? total + (lesson.duration || 0) : total, 0
                            ))}
                          </div>
                          <div className="text-sm text-gray-600">Time Spent</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
                    <div className="space-y-3">
                      {lessons.filter(l => isLessonCompleted(l.id)).slice(-5).reverse().map(lesson => (
                        <div key={lesson.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                          <div>
                            <div className="font-medium text-gray-900">Completed: {lesson.title}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(progress[lesson.id]?.completed_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* AI Quiz Tab */}
              {activeTab === 'ai-quiz' && (
                <div>
                  {!showAIQuiz ? (
                    <div className="text-center py-12">
                      <LightBulbIcon className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">AI-Powered Quiz</h3>
                      <p className="text-gray-600 mb-6">
                        Test your knowledge with an AI-generated quiz based on this course content.
                      </p>
                      <button
                        onClick={generateAIQuiz}
                        className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                      >
                        <LightBulbIcon className="h-5 w-5 mr-2" />
                        Generate Quiz
                      </button>
                    </div>
                  ) : quizScore !== null ? (
                    <div className="text-center py-12">
                      <div className="text-6xl font-bold text-purple-600 mb-4">{quizScore}%</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Quiz Complete!</h3>
                      <p className="text-gray-600 mb-6">
                        {quizScore >= 80 ? 'Excellent work!' : 'Keep studying to improve your score.'}
                      </p>
                      <button
                        onClick={() => setShowAIQuiz(false)}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                      >
                        Take Another Quiz
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">AI Quiz</h3>
                        <div className="text-sm text-gray-500">
                          Question {currentQuizQuestion + 1} of {aiQuizQuestions.length}
                        </div>
                      </div>

                      {aiQuizQuestions[currentQuizQuestion] && (
                        <div className="space-y-6">
                          <div className="bg-gray-50 p-6 rounded-lg">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                              {aiQuizQuestions[currentQuizQuestion].question}
                            </h4>
                            <div className="space-y-3">
                              {aiQuizQuestions[currentQuizQuestion].options.map((option, index) => (
                                <button
                                  key={index}
                                  onClick={() => submitQuizAnswer(currentQuizQuestion, index)}
                                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                                    quizAnswers[currentQuizQuestion] === index
                                      ? 'border-purple-500 bg-purple-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-between">
                            <button
                              onClick={() => setCurrentQuizQuestion(prev => Math.max(0, prev - 1))}
                              disabled={currentQuizQuestion === 0}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
                            >
                              Previous
                            </button>
                            
                            {currentQuizQuestion === aiQuizQuestions.length - 1 ? (
                              <button
                                onClick={submitQuiz}
                                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
                              >
                                Submit Quiz
                              </button>
                            ) : (
                              <button
                                onClick={() => setCurrentQuizQuestion(prev => prev + 1)}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
                              >
                                Next
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Other tabs can be implemented similarly */}
              {activeTab === 'discussion' && (
                <div className="text-center py-12">
                  <ChatBubbleLeftIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Discussion Forum</h3>
                  <p className="text-gray-600 mb-6">
                    Join the discussion with other students and instructors.
                  </p>
                  <button
                    onClick={() => navigate(`/courses/${id}/discussion`)}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    View Discussion
                  </button>
                </div>
              )}

              {activeTab === 'assignments' && (
                <div className="text-center py-12">
                  <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Assignments</h3>
                  <p className="text-gray-600 mb-6">
                    Complete assignments to test your understanding.
                  </p>
                  <button
                    onClick={() => navigate(`/courses/${id}/assignments`)}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    View Assignments
                  </button>
                </div>
              )}

              {activeTab === 'students' && (
                <div className="text-center py-12">
                  <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Enrolled Students</h3>
                  <p className="text-gray-600 mb-6">
                    View other students enrolled in this course.
                  </p>
                  <button
                    onClick={() => navigate(`/courses/${id}/students`)}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    View Students
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Enroll to Access Course Content</h2>
            <p className="text-gray-600 mb-6">You must enroll in this course to view lessons, discussions, assignments, and more.</p>
            {!enrolled && user && user.role !== 'instructor' && (
              <button
                onClick={handleEnroll}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                disabled={enrolling}
              >
                {enrolling ? 'Enrolling...' : 'Enroll in Course'}
              </button>
            )}
            {enrollError && <div className="text-red-500 mt-2">{enrollError}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
