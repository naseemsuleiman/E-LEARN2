import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  PlayIcon, 
  PauseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  BookOpenIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function CoursePlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [modules, setModules] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  useEffect(() => {
    if (currentLesson) {
      fetchProgress();
      fetchNotes();
    }
  }, [currentLesson]);

  const fetchCourseData = async () => {
  try {
    const [courseRes, modulesRes, lessonsRes] = await Promise.all([
      api.get(`/api/courses/${id}/`),
      api.get(`/api/modules/?course=${id}`),
      api.get(`/api/courses/${id}/lessons/`)
    ]);

    setCourse(courseRes.data);
    setModules(modulesRes.data);
    setLessons(lessonsRes.data); // only set here
  } catch (error) {
    console.error('Error fetching course:', error);
  } finally {
    setLoading(false);
  }
};

// Automatically set the current lesson when lessons are available
useEffect(() => {
  if (lessons.length > 0 && !currentLesson) {
    setCurrentLesson(lessons[0]);
  }
}, [lessons]);


  const fetchProgress = async () => {
    try {
      const response = await api.get(`/api/courses/${id}/progress/`);
      setProgress(response.data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const fetchNotes = async () => {
    if (!currentLesson) return;
    try {
      const response = await api.get(`/api/lessons/${currentLesson.id}/notes/`);
      setNotes(response.data.notes || '');
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const saveProgress = async (lessonId, time) => {
    try {
      await api.post(`/api/lessons/${lessonId}/progress/`, {
        current_time: time,
        completed: time >= duration * 0.9 // Mark as completed if watched 90%
      });
      fetchProgress(); // Refresh progress data
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const saveNotes = async () => {
    if (!currentLesson) return;
    try {
      await api.post(`/api/lessons/${currentLesson.id}/notes/`, {
        notes: notes
      });
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoTimeUpdate = (e) => {
    const time = e.target.currentTime;
    setCurrentTime(time);
    
    // Save progress every 30 seconds
    if (Math.floor(time) % 30 === 0 && currentLesson) {
      saveProgress(currentLesson.id, time);
    }
  };

  const handleVideoLoaded = (e) => {
    setDuration(e.target.duration);
    // Restore saved progress if available
    if (currentLesson && progress[currentLesson.id]) {
      e.target.currentTime = progress[currentLesson.id].current_time || 0;
    }
  };

  const handleVideoEnded = () => {
    if (currentLesson) {
      saveProgress(currentLesson.id, duration);
    }
    setIsPlaying(false);
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLessonCompleted = (lessonId) => {
    return progress[lessonId]?.completed || false;
  };

  // Helper to get lesson progress percent
  const getLessonProgress = (lessonId, lessonDuration) => {
    const prog = progress[lessonId];
    if (!prog || !lessonDuration) return 0;
    // watched_duration may be greater than duration if user skips, so cap at 100%
    return Math.min(100, Math.round((prog.watched_duration / lessonDuration) * 100));
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1` : null;
  };

  const getVimeoEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/;
    const match = url.match(regExp);
    const videoId = match ? match[5] : null;
    return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
  };

  const renderVideoPlayer = () => {
    if (!currentLesson) {
      return (
        <div className="flex items-center justify-center h-full bg-black text-white">
          <p>Select a lesson to start watching</p>
        </div>
      );
    }

    // Check for YouTube URL
    const youtubeUrl = getYouTubeEmbedUrl(currentLesson.video_url);
    if (youtubeUrl) {
      return (
        <div className="relative w-full h-full">
          <iframe
            src={youtubeUrl}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    }

    // Check for Vimeo URL
    const vimeoUrl = getVimeoEmbedUrl(currentLesson.video_url);
    if (vimeoUrl) {
      return (
        <div className="relative w-full h-full">
          <iframe
            src={vimeoUrl}
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    }

    // Handle direct video file (either from URL or uploaded file)
    const videoSrc = currentLesson.video_url || currentLesson.video_file;
    if (videoSrc) {
      return (
        <div className="relative w-full h-full bg-black">
          <video
            ref={videoRef}
            src={videoSrc}
            className="w-full h-full"
            controls
            onTimeUpdate={handleVideoTimeUpdate}
            onLoadedMetadata={handleVideoLoaded}
            onEnded={handleVideoEnded}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePlayPause}
                className="p-2 text-white hover:text-purple-300 transition-colors"
              >
                {isPlaying ? (
                  <PauseIcon className="h-6 w-6" />
                ) : (
                  <PlayIcon className="h-6 w-6" />
                )}
              </button>
              <div className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Fallback if no video available
    return (
      <div className="flex items-center justify-center h-full bg-black text-white">
        <p>No video available for this lesson</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
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
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/courses/${id}`)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back to Course</span>
            </button>
            <div className="border-l border-gray-600 h-6"></div>
            <div>
              <h1 className="text-xl font-semibold">{course.title}</h1>
              <p className="text-gray-400 text-sm">{currentLesson?.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                showNotes ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <DocumentTextIcon className="h-4 w-4" />
              <span>Notes</span>
            </button>
            <button
              onClick={() => navigate(`/courses/${id}/discussion`)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
            >
              <ChatBubbleLeftIcon className="h-4 w-4" />
              <span>Discussion</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Video Player */}
        <div className="flex-1 bg-black">
          {renderVideoPlayer()}
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-800 text-white overflow-y-auto">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Course Content</h3>
            
            {modules.length > 0 ? (
              modules.map((module) => (
                <div key={module.id} className="mb-4">
                  <h4 className="font-medium text-sm mb-2">
                    {module.title}
                  </h4>
                  
                  {lessons
                    .filter(lesson => lesson.module === module.id)
                    .map((lesson) => (
                      <div
                        key={lesson.id}
                        onClick={() => setCurrentLesson(lesson)}
                        className={`flex flex-col space-y-1 p-2 rounded cursor-pointer transition-colors ${
                          currentLesson?.id === lesson.id
                            ? 'bg-purple-600 text-white'
                            : 'hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <PlayIcon className="h-4 w-4" />
                          <div className="flex-1">
                            <div className="text-sm">{lesson.title}</div>
                            <div className="text-xs text-gray-400">
                              {lesson.duration ? formatTime(lesson.duration) : 'N/A'}
                            </div>
                          </div>
                          {isLessonCompleted(lesson.id) && (
                            <CheckCircleIcon className="h-4 w-4 text-green-400" />
                          )}
                        </div>
                        {/* Progress bar for this lesson */}
                        {lesson.duration > 0 && (
                          <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                            <div
                              className="h-1 rounded-full bg-purple-400 transition-all duration-300"
                              style={{ width: `${getLessonProgress(lesson.id, lesson.duration)}%` }}
                            ></div>
                          </div>
                        )}
                        {/* Show percent if not completed */}
                        {!isLessonCompleted(lesson.id) && lesson.duration > 0 && (
                          <div className="text-xs text-gray-300 mt-0.5">{getLessonProgress(lesson.id, lesson.duration)}%</div>
                        )}
                      </div>
                    ))
                  }
                </div>
              ))
            ) : (
              lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  onClick={() => setCurrentLesson(lesson)}
                  className={`flex flex-col space-y-1 p-2 rounded cursor-pointer transition-colors ${
                    currentLesson?.id === lesson.id
                      ? 'bg-purple-600 text-white'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <PlayIcon className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="text-sm">{lesson.title}</div>
                      <div className="text-xs text-gray-400">
                        {lesson.duration ? formatTime(lesson.duration) : 'N/A'}
                      </div>
                    </div>
                    {isLessonCompleted(lesson.id) && (
                      <CheckCircleIcon className="h-4 w-4 text-green-400" />
                    )}
                  </div>
                  {/* Progress bar for this lesson */}
                  {lesson.duration > 0 && (
                    <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                      <div
                        className="h-1 rounded-full bg-purple-400 transition-all duration-300"
                        style={{ width: `${getLessonProgress(lesson.id, lesson.duration)}%` }}
                      ></div>
                    </div>
                  )}
                  {/* Show percent if not completed */}
                  {!isLessonCompleted(lesson.id) && lesson.duration > 0 && (
                    <div className="text-xs text-gray-300 mt-0.5">{getLessonProgress(lesson.id, lesson.duration)}%</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notes Panel */}
        {showNotes && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Notes for {currentLesson?.title || 'Current Lesson'}
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={saveNotes}
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="Take notes while watching the video..."
              />
              <div className="mt-4 text-sm text-gray-500">
                Notes are automatically saved when you click outside the textarea.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}