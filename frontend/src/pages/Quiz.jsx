import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { apiService } from '../services/api';
import { 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function Quiz() {
  const { id, quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState(null);
  const [aiQuestions, setAiQuestions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [course, setCourse] = useState(null);

  useEffect(() => {
    fetchQuizData();
  }, [quizId]);

  useEffect(() => {
    let timer;
    if (isStarted && timeLeft > 0 && !isSubmitted) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isStarted, timeLeft, isSubmitted]);

  const fetchQuizData = async () => {
    try {
      const response = await api.get(`/quizzes/${quizId}/`);
      setQuiz(response.data);
      setQuestions(response.data.questions || []);
      
      if (response.data.time_limit > 0) {
        setTimeLeft(response.data.time_limit * 60); // Convert to seconds
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async () => {
    try {
      const response = await api.post(`/quizzes/${quizId}/attempts/`);
      setAttemptId(response.data.id);
      setIsStarted(true);
    } catch (error) {
      console.error('Error starting quiz:', error);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleMultipleChoiceChange = (questionId, optionId, isChecked) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      if (isChecked) {
        return {
          ...prev,
          [questionId]: [...currentAnswers, optionId]
        };
      } else {
        return {
          ...prev,
          [questionId]: currentAnswers.filter(id => id !== optionId)
        };
      }
    });
  };

  const handleSubmitQuiz = async () => {
    if (!attemptId) return;

    try {
      const responses = Object.entries(answers).map(([questionId, answer]) => ({
        question: parseInt(questionId),
        selected_options: Array.isArray(answer) ? answer : [],
        text_answer: Array.isArray(answer) ? '' : answer
      }));

      await api.post(`/quiz-attempts/${attemptId}/submit/`, {
        responses
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCurrentQuestion = () => {
    return questions[currentQuestionIndex];
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  // Fetch course info for AI quiz context
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/api/courses/${id}/`);
        setCourse(res.data);
      } catch (e) {
        setCourse(null);
      }
    };
    fetchCourse();
  }, [id]);

  const handleGenerateAIQuiz = async () => {
    if (!course) return;
    setAiLoading(true);
    setAiError('');
    try {
      const data = await apiService.generateGeminiQuiz({
        heading: course.title,
        content: course.description || ''
      });
      let questions = [];
      if (typeof data.questions === 'string') {
        try {
          questions = JSON.parse(data.questions);
        } catch (e) {
          // fallback: split by newlines if not valid JSON
          questions = data.questions.split('\n');
        }
      } else if (Array.isArray(data.questions)) {
        questions = data.questions;
      }
      setAiQuestions(questions);
    } catch (e) {
      setAiError(e.message);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quiz Not Found</h2>
          <p className="text-gray-600">The quiz you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{quiz.title}</h1>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Quiz Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium">Questions:</span> {questions.length}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Time Limit:</span> {quiz.time_limit > 0 ? `${quiz.time_limit} minutes` : 'No time limit'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Passing Score:</span> {quiz.passing_score}%
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Attempts Allowed:</span> {quiz.attempts_allowed}
                  </p>
                </div>
              </div>

              {quiz.description && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{quiz.description}</p>
                </div>
              )}

              <div className="my-8">
                <button
                  onClick={handleGenerateAIQuiz}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
                  disabled={aiLoading || !course}
                >
                  {aiLoading ? 'Generating AI Quiz...' : 'Generate AI Quiz with Gemini'}
                </button>
                {aiError && <div className="text-red-500 mt-2">{aiError}</div>}
                {aiQuestions.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-bold mb-2 text-blue-700">AI-Generated Questions:</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      {aiQuestions.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => navigate(`/courses/${id}/learn`)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back to Course
                </button>
                <button
                  onClick={startQuiz}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Start Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Quiz Submitted!</h1>
            <p className="text-gray-600 mb-6">
              Your quiz has been submitted successfully. You can view your results in the course dashboard.
            </p>
            <button
              onClick={() => navigate(`/courses/${id}/learn`)}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Back to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{quiz.title}</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            
            {quiz.time_limit > 0 && (
              <div className="flex items-center space-x-2 text-lg font-medium">
                <ClockIcon className="h-5 w-5 text-red-500" />
                <span className={timeLeft < 300 ? 'text-red-500' : 'text-gray-900'}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-8">
              {currentQuestion && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      {currentQuestion.question_text}
                    </h2>
                    
                    {currentQuestion.question_type === 'multiple_choice' && (
                      <div className="space-y-3">
                        {currentQuestion.options?.map((option) => (
                          <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={answers[currentQuestion.id]?.includes(option.id) || false}
                              onChange={(e) => handleMultipleChoiceChange(currentQuestion.id, option.id, e.target.checked)}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <span className="text-gray-900">{option.option_text}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    
                    {currentQuestion.question_type === 'true_false' && (
                      <div className="space-y-3">
                        {['True', 'False'].map((option) => (
                          <label key={option} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name={`question-${currentQuestion.id}`}
                              value={option}
                              checked={answers[currentQuestion.id] === option}
                              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                            />
                            <span className="text-gray-900">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    
                    {currentQuestion.question_type === 'short_answer' && (
                      <textarea
                        value={answers[currentQuestion.id] || ''}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter your answer..."
                      />
                    )}
                    
                    {currentQuestion.question_type === 'essay' && (
                      <textarea
                        value={answers[currentQuestion.id] || ''}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter your detailed answer..."
                      />
                    )}
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={goToPreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowLeftIcon className="h-4 w-4" />
                      <span>Previous</span>
                    </button>
                    
                    <div className="flex space-x-3">
                      {currentQuestionIndex === questions.length - 1 ? (
                        <button
                          onClick={handleSubmitQuiz}
                          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          Submit Quiz
                        </button>
                      ) : (
                        <button
                          onClick={goToNextQuestion}
                          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                        >
                          <span>Next</span>
                          <ArrowRightIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Question Navigator */}
          <div className="w-64">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Question Navigator</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => goToQuestion(index)}
                    className={`p-2 rounded-md text-sm font-medium transition-colors ${
                      index === currentQuestionIndex
                        ? 'bg-purple-600 text-white'
                        : answers[question.id]
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-600 rounded"></div>
                  <span>Current</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 rounded"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-100 rounded"></div>
                  <span>Unanswered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 