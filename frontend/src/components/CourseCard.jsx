import React from 'react';
import { Link } from 'react-router-dom';
import { 
  StarIcon, 
  ClockIcon, 
  UserIcon, 
  BookOpenIcon,
  HeartIcon,
  PlayIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const CourseCard = ({ 
  course, 
  onWishlistToggle, 
  isWishlisted = false,
  showInstructor = true,
  className = '' 
}) => {
  const formatPrice = (price) => {
    if (price === 0 || price === '0.00') {
      return 'Free';
    }
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  const formatRating = (rating) => {
    if (!rating) return 'No ratings';
    return `${rating.toFixed(1)} (${course.total_ratings || 0} reviews)`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'Beginner';
      case 'intermediate':
        return 'Intermediate';
      case 'advanced':
        return 'Advanced';
      default:
        return 'All Levels';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-emerald-100 group ${className}`}>
      {/* Course Thumbnail */}
      <div className="relative">
        <img
          src={course.thumbnail ? course.thumbnail : '/default-course-thumbnail.jpg'}
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/default-course-thumbnail.jpg';
          }}
        />
        
        {/* Overlay with play button */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="bg-white bg-opacity-90 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <PlayIcon className="h-6 w-6 text-emerald-600" />
          </div>
        </div>

        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            course.price === 0 || course.price === '0.00' 
              ? 'bg-emerald-500 text-white' 
              : 'bg-white text-emerald-600'
          }`}>
            {formatPrice(course.price)}
          </span>
        </div>

        {/* Wishlist Button */}
        {onWishlistToggle && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onWishlistToggle(course.id);
            }}
            className={`absolute top-3 left-3 p-2 rounded-full transition-all duration-200 ${
              isWishlisted 
                ? 'bg-red-500 text-white' 
                : 'bg-white text-gray-600 hover:text-red-500'
            }`}
          >
            <HeartIcon className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Difficulty Badge */}
        <div className="absolute bottom-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
            {getDifficultyLabel(course.difficulty)}
          </span>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-6">
        {/* Category */}
        {course.category && (
          <div className="mb-2">
            <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
              {course.category.name}
            </span>
          </div>
        )}

        {/* Title */}
        <Link to={`/courses/${course.id}`} className="block">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
            {course.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.short_description || course.description}
        </p>

        {/* Instructor */}
        {showInstructor && course.instructor && (
          <div className="flex items-center mb-4">
            <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">
              {course.instructor.username}
            </span>
          </div>
        )}

        {/* Course Stats */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>{formatDuration(course.duration)}</span>
          </div>
          <div className="flex items-center">
            <BookOpenIcon className="h-4 w-4 mr-1" />
            <span>{course.total_lessons || 0} lessons</span>
          </div>
          <div className="flex items-center">
            <AcademicCapIcon className="h-4 w-4 mr-1" />
            <span>{course.enrolled_students || 0} students</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex items-center mr-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.floor(course.rating || 0)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {formatRating(course.rating)}
          </span>
        </div>

        {/* Tags */}
        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {course.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {course.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{course.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Link
            to={`/courses/${course.id}`}
            className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg text-center font-medium hover:bg-emerald-700 transition-colors"
          >
            View Course
          </Link>
          {course.price > 0 && (
            <button className="px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors">
              Enroll
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard; 