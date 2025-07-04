import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  HeartIcon, 
  StarIcon,
  ClockIcon,
  UserIcon,
  PlayIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export default function Wishlist() {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/api/wishlist/');
      setWishlist(response.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (courseId) => {
    try {
      await api.delete(`/wishlist/${courseId}/`);
      setWishlist(prev => prev.filter(item => item.course.id !== courseId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const enrollInCourse = async (courseId) => {
    try {
      await api.post(`/courses/${courseId}/enroll/`, {
        payment_status: 'paid'
      });
      // Remove from wishlist after enrollment
      await removeFromWishlist(courseId);
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatPrice = (price) => {
    return price === 0 ? 'Free' : `$${price}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">My Wishlist</h1>
          <p className="text-emerald-600">Courses you're interested in</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-12">
            <HeartIcon className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-emerald-900 mb-2">Your wishlist is empty</h3>
            <p className="text-emerald-600 mb-6">
              Start adding courses to your wishlist to keep track of what you want to learn.
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map(item => (
              <div key={item.id} className="bg-emerald-50 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Course Thumbnail */}
                <div className="relative">
                  <img
                    src={item.course.thumbnail || 'https://via.placeholder.com/300x200?text=Course+Image'}
                    alt={item.course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <PlayIcon className="h-12 w-12 text-white" />
                  </div>
                  
                  {/* Wishlist Icon */}
                  <button
                    onClick={() => removeFromWishlist(item.course.id)}
                    className="absolute top-2 right-2 p-2 bg-emerald-50 rounded-full shadow-sm hover:bg-emerald-100 transition-colors"
                  >
                    <TrashIcon className="h-5 w-5 text-emerald-800" />
                  </button>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-emerald-500">
                      {item.course.category?.name || 'Uncategorized'}
                    </span>
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 text-lime-400 fill-current" />
                      <span className="text-sm text-emerald-600 ml-1">
                        {item.course.rating.toFixed(1)} ({item.course.total_ratings})
                      </span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-emerald-900 mb-2 line-clamp-2">
                    <Link to={`/courses/${item.course.id}`} className="hover:text-emerald-600">
                      {item.course.title}
                    </Link>
                  </h3>

                  <p className="text-emerald-600 text-sm mb-4 line-clamp-2">
                    {item.course.short_description || item.course.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-emerald-500 mb-4">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-1" />
                      <span>{item.course.instructor?.username}</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>{formatDuration(item.course.duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-emerald-900">
                      {formatPrice(item.course.price)}
                    </span>
                    <div className="flex space-x-2">
                      <Link
                        to={`/courses/${item.course.id}`}
                        className="px-4 py-2 border border-emerald-200 rounded-md text-emerald-700 hover:bg-emerald-100 transition-colors text-sm"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => enrollInCourse(item.course.id)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm"
                      >
                        Enroll Now
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-500 mt-2">
                    Added on {new Date(item.added_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 