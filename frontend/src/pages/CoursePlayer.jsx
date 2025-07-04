import React, { useState, useEffect } from 'react';
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
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

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
      const response = await api.get(`/api/courses/${id}/`);
      setCourse(response.data);
      
      // Set first lesson as current if available
      if (response.data.lessons && response.data.lessons.length > 0) {
        setCurrentLesson(response.data.lessons[0]);
        if (response.data.lessons[0].videos && response.data.lessons[0].videos.length > 0) {
          setCurrentVideo(response.data.lessons[0].videos[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const saveProgress = async (lessonId, videoId, time) => {
    try {
      await api.post(`/api/courses/${id}/progress/`, {
        lesson_id: lessonId,
        video_id: videoId,
        current_time: time,
        completed: time >= duration * 0.9 // Mark as completed if watched 90%
      });
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

  const handleVideoTimeUpdate = (e) => {
    const time = e.target.currentTime;
    setCurrentTime(time);
    
    // Save progress every 30 seconds
    if (Math.floor(time) % 30 === 0 && currentLesson && currentVideo) {
      saveProgress(currentLesson.id, currentVideo.id, time);
    }
  };

  const handleVideoLoaded = (e) => {
    setDuration(e.target.duration);
  };

  const handleVideoEnded = () => {
    if (currentLesson && currentVideo) {
      saveProgress(currentLesson.id, currentVideo.id, duration);
    }
    setIsPlaying(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLessonCompleted = (lessonId) => {
    return progress[lessonId]?.completed || false;
  };

  const isVideoCompleted = (videoId) => {
    return progress[videoId]?.completed || false;
  };

  // Helper to render a video (file or URL)
  const renderVideo = (videoUrl, fileUrl) => {
    if (!videoUrl && !fileUrl) return <div className="text-gray-400">No video available.</div>;
    // If it's a YouTube/Vimeo link
    if (videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || videoUrl.includes('vimeo.com'))) {
      return (
        <iframe
          src={videoUrl}
          title="Lesson Video"
          className="w-full h-96"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      );
    }
    // If it's a direct video file (mp4, webm, etc.)
    const src = videoUrl || fileUrl;
    return (
      <video
        src={src}
        controls
        className="w-full h-96 bg-black"
        onTimeUpdate={handleVideoTimeUpdate}
        onLoadedMetadata={handleVideoLoaded}
        onEnded={handleVideoEnded}
      />
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
              className="flex items-center space-x-2 px-3 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
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

      <div className="flex h-screen">
        {/* Video Player */}
        <div className="flex-1 bg-black">
          {/* Show course intro video if no lesson selected, else show lesson video */}
          {currentLesson ? (
            renderVideo(currentLesson.video_url, currentLesson.file_attachment)
          ) : course.video_intro ? (
            renderVideo(course.video_intro, null)
          ) : (
            <div className="text-gray-400 p-8">No video available.</div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-800 text-white overflow-y-auto">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Course Content</h3>
            
            {course.lessons?.map((lesson, lessonIndex) => (
              <div key={lesson.id} className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">
                    Lesson {lessonIndex + 1}: {lesson.title}
                  </h4>
                  {isLessonCompleted(lesson.id) && (
                    <CheckCircleIcon className="h-4 w-4 text-green-400" />
                  )}
                </div>
                
                {lesson.videos?.map((video, videoIndex) => (
                  <div
                    key={video.id}
                    onClick={() => {
                      setCurrentLesson(lesson);
                      setCurrentVideo(video);
                    }}
                    className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                      currentVideo?.id === video.id
                        ? 'bg-purple-600 text-white'
                        : 'hover:bg-gray-700'
                    }`}
                  >
                    <PlayIcon className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="text-sm">
                        {videoIndex + 1}. {video.title}
                      </div>
                      <div className="text-xs text-gray-400">
                        {video.duration ? formatTime(video.duration) : 'N/A'}
                      </div>
                    </div>
                    {isVideoCompleted(video.id) && (
                      <CheckCircleIcon className="h-4 w-4 text-green-400" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Notes Panel */}
        {showNotes && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">My Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={saveNotes}
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="Take notes while watching the video..."
              />
              <div className="mt-4 text-sm text-gray-500">
                Notes are automatically saved as you type.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 