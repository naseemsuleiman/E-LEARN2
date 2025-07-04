import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  ChatBubbleLeftIcon, 
  UserIcon,
  ClockIcon,
  HandThumbUpIcon,
  ArrowUturnLeftIcon,
  PlusIcon,
  BookmarkIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

export default function Discussion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [selectedThread, setSelectedThread] = useState(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchThreads();
  }, [id]);

  const fetchThreads = async () => {
    try {
      const response = await api.get(`/courses/${id}/discussions/`);
      setThreads(response.data);
    } catch (error) {
      console.error('Error fetching discussion threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !newThreadContent.trim()) {
      alert('Please fill in both title and content.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post(`/courses/${id}/discussions/`, {
        title: newThreadTitle,
        content: newThreadContent
      });

      setThreads(prev => [response.data, ...prev]);
      setNewThreadTitle('');
      setNewThreadContent('');
      setShowNewThreadForm(false);
    } catch (error) {
      console.error('Error creating thread:', error);
      alert('Error creating thread. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreatePost = async (threadId) => {
    if (!newPostContent.trim()) {
      alert('Please enter a post content.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post(`/discussions/${threadId}/posts/`, {
        content: newPostContent
      });

      // Update the thread with the new post
      setThreads(prev => prev.map(thread => 
        thread.id === threadId 
          ? { ...thread, posts: [...(thread.posts || []), response.data] }
          : thread
      ));

      setNewPostContent('');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-emerald-800 mb-2">Course Discussion</h1>
              <p className="text-emerald-600">Connect with your classmates and instructor</p>
            </div>
            <button
              onClick={() => setShowNewThreadForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg"
            >
              <PlusIcon className="h-4 w-4" />
              <span>New Thread</span>
            </button>
          </div>
        </div>

        {/* New Thread Form */}
        {showNewThreadForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-emerald-100">
            <h3 className="text-lg font-medium text-emerald-800 mb-4">Create New Thread</h3>
            <form onSubmit={handleCreateThread} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thread Title *
                </label>
                <input
                  type="text"
                  value={newThreadTitle}
                  onChange={(e) => setNewThreadTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter thread title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={newThreadContent}
                  onChange={(e) => setNewThreadContent(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Write your post content..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Thread'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewThreadForm(false);
                    setNewThreadTitle('');
                    setNewThreadContent('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Discussion Threads */}
        {threads.length === 0 ? (
          <div className="text-center py-12">
            <ChatBubbleLeftIcon className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-emerald-800 mb-2">No discussions yet</h3>
            <p className="text-emerald-600 mb-6">
              Be the first to start a discussion in this course.
            </p>
            <button
              onClick={() => setShowNewThreadForm(true)}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Start Discussion
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {threads.map(thread => (
              <div key={thread.id} className="bg-white rounded-lg shadow-lg p-6 border border-emerald-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-semibold text-emerald-800">
                        {thread.title}
                      </h3>
                      {thread.is_pinned && (
                        <BookmarkIcon className="h-4 w-4 text-yellow-500" />
                      )}
                      {thread.is_locked && (
                        <LockClosedIcon className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-1" />
                        <span>{thread.created_by?.username}</span>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span>{formatDate(thread.created_at)}</span>
                      </div>
                      <span>{thread.posts?.length || 0} replies</span>
                      <span>{thread.views} views</span>
                    </div>

                    <p className="text-gray-600 mb-4">{thread.content}</p>
                  </div>
                </div>

                {/* Thread Actions */}
                <div className="flex items-center justify-between border-t border-emerald-200 pt-4">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-emerald-600 transition-colors">
                      <HandThumbUpIcon className="h-4 w-4" />
                      <span>Like</span>
                    </button>
                    <button 
                      onClick={() => setSelectedThread(selectedThread?.id === thread.id ? null : thread)}
                      className="flex items-center space-x-1 text-gray-500 hover:text-emerald-600 transition-colors"
                    >
                      <ArrowUturnLeftIcon className="h-4 w-4" />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>

                {/* Reply Form */}
                {selectedThread?.id === thread.id && (
                  <div className="mt-4 border-t border-emerald-200 pt-4">
                    <h4 className="font-medium text-emerald-800 mb-3">Add Reply</h4>
                    <div className="space-y-3">
                      <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Write your reply..."
                      />
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleCreatePost(thread.id)}
                          disabled={submitting}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        >
                          {submitting ? 'Posting...' : 'Post Reply'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedThread(null);
                            setNewPostContent('');
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Posts */}
                {thread.posts && thread.posts.length > 0 && (
                  <div className="mt-4 space-y-4">
                    <h4 className="font-medium text-emerald-800">Replies</h4>
                    {thread.posts.map(post => (
                      <div key={post.id} className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-emerald-800">
                              {post.author?.username}
                            </span>
                            {post.is_solution && (
                              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">
                                Best Answer
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{formatDate(post.created_at)}</span>
                            <span>{formatTime(post.created_at)}</span>
                          </div>
                        </div>
                        <p className="text-gray-700">{post.content}</p>
                        <div className="flex items-center space-x-4 mt-3">
                          <button className="flex items-center space-x-1 text-gray-500 hover:text-emerald-600 transition-colors text-sm">
                            <HandThumbUpIcon className="h-3 w-3" />
                            <span>Like</span>
                          </button>
                          <button className="flex items-center space-x-1 text-gray-500 hover:text-emerald-600 transition-colors text-sm">
                            <ArrowUturnLeftIcon className="h-3 w-3" />
                            <span>Reply</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 