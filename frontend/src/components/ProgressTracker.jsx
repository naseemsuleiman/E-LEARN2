import React from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  AcademicCapIcon,
  TrophyIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

const ProgressTracker = ({ 
  progress, 
  totalLessons, 
  completedLessons, 
  timeSpent, 
  certificates = [],
  achievements = [],
  className = '' 
}) => {
  const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  
  const formatTime = (minutes) => {
    if (!minutes) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getProgressColor = (percent) => {
    if (percent >= 80) return 'bg-emerald-500';
    if (percent >= 60) return 'bg-blue-500';
    if (percent >= 40) return 'bg-yellow-500';
    if (percent >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getProgressText = (percent) => {
    if (percent === 100) return 'Completed!';
    if (percent >= 80) return 'Almost there!';
    if (percent >= 60) return 'Great progress!';
    if (percent >= 40) return 'Keep going!';
    if (percent >= 20) return 'Getting started';
    return 'Just beginning';
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-emerald-100 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <ChartBarIcon className="h-6 w-6 text-emerald-600 mr-2" />
          <h3 className="text-lg font-bold text-gray-900">Learning Progress</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-600">{percentage}%</div>
          <div className="text-sm text-gray-500">{getProgressText(percentage)}</div>
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Overall Progress</span>
          <span>{completedLessons} of {totalLessons} lessons</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(percentage)}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-emerald-50 rounded-lg p-4">
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 text-emerald-600 mr-2" />
            <div>
              <div className="text-sm text-gray-600">Time Spent</div>
              <div className="font-semibold text-emerald-800">{formatTime(timeSpent)}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <AcademicCapIcon className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <div className="text-sm text-gray-600">Lessons Completed</div>
              <div className="font-semibold text-blue-800">{completedLessons}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      {achievements.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <TrophyIcon className="h-4 w-4 text-yellow-500 mr-2" />
            Recent Achievements
          </h4>
          <div className="space-y-2">
            {achievements.slice(0, 3).map((achievement, index) => (
              <div key={index} className="flex items-center p-2 bg-yellow-50 rounded-lg">
                <TrophyIcon className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">{achievement.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificates */}
      {certificates.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Certificates Earned</h4>
          <div className="space-y-2">
            {certificates.map((certificate, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircleIconSolid className="h-5 w-5 text-emerald-600 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-emerald-800">{certificate.course_title}</div>
                    <div className="text-xs text-emerald-600">
                      Earned {new Date(certificate.issued_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <button className="text-xs text-emerald-600 hover:text-emerald-800 underline">
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Milestones */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Progress Milestones</h4>
        <div className="space-y-2">
          {[
            { percent: 25, label: 'Quarter Complete', icon: CheckCircleIcon },
            { percent: 50, label: 'Halfway There', icon: CheckCircleIcon },
            { percent: 75, label: 'Almost Done', icon: CheckCircleIcon },
            { percent: 100, label: 'Course Complete', icon: CheckCircleIconSolid }
          ].map((milestone, index) => (
            <div key={index} className="flex items-center">
              <milestone.icon 
                className={`h-4 w-4 mr-2 ${
                  percentage >= milestone.percent 
                    ? 'text-emerald-600' 
                    : 'text-gray-300'
                }`} 
              />
              <span className={`text-sm ${
                percentage >= milestone.percent 
                  ? 'text-emerald-800 font-medium' 
                  : 'text-gray-500'
              }`}>
                {milestone.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Motivation Message */}
      {percentage < 100 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
          <div className="text-center">
            <div className="text-sm font-medium text-emerald-800 mb-1">
              Keep up the great work!
            </div>
            <div className="text-xs text-emerald-600">
              {percentage < 25 && "You're just getting started. Every lesson brings you closer to your goal!"}
              {percentage >= 25 && percentage < 50 && "You're making excellent progress. Stay consistent!"}
              {percentage >= 50 && percentage < 75 && "You're more than halfway there. Keep pushing forward!"}
              {percentage >= 75 && "You're almost there! Just a few more lessons to complete the course."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker; 