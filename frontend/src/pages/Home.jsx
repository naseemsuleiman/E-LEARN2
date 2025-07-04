import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import CourseCard from '../components/CourseCard';
import SearchAndFilter from '../components/SearchAndFilter';
import { 
  PlayIcon, 
  AcademicCapIcon, 
  UserGroupIcon, 
  StarIcon,
  ArrowRightIcon,
  BookOpenIcon,
  TrophyIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const [courses, setCourses] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, categoriesRes] = await Promise.all([
              api.get('/api/courses/'),
      api.get('/api/categories/')
      ]);

      setCourses(coursesRes.data);
      setFeaturedCourses(coursesRes.data.filter(course => course.is_featured).slice(0, 6));
      setCategories(categoriesRes.data);
    } catch (err) {
      error('Failed to load courses');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };

  const handleWishlistToggle = async (courseId) => {
    try {
      await api.post('/wishlist/', { course: courseId });
      success('Course added to wishlist!');
    } catch (err) {
      error('Failed to update wishlist');
    }
  };

  const stats = [
    { icon: UserGroupIcon, label: 'Students', value: '10,000+', color: 'emerald' },
    { icon: BookOpenIcon, label: 'Courses', value: '500+', color: 'blue' },
    { icon: AcademicCapIcon, label: 'Instructors', value: '200+', color: 'purple' },
    { icon: StarIcon, label: 'Rating', value: '4.8/5', color: 'yellow' }
  ];

  const features = [
    {
      icon: PlayIcon,
      title: 'Video Learning',
      description: 'High-quality video content with interactive elements'
    },
    {
      icon: AcademicCapIcon,
      title: 'Expert Instructors',
      description: 'Learn from industry professionals and experts'
    },
    {
      icon: TrophyIcon,
      title: 'Certificates',
      description: 'Earn certificates upon course completion'
    },
    {
      icon: ClockIcon,
      title: 'Flexible Learning',
      description: 'Learn at your own pace, anytime, anywhere'
    },
    {
      icon: CheckCircleIcon,
      title: 'Progress Tracking',
      description: 'Monitor your learning progress and achievements'
    },
    {
      icon: UserGroupIcon,
      title: 'Community',
      description: 'Connect with fellow learners and instructors'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading amazing courses..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-emerald-800 mb-6">
              Learn Without Limits
            </h1>
            <p className="text-xl text-emerald-600 mb-8 max-w-3xl mx-auto">
              Start, switch, or advance your career with thousands of courses from world-class universities and companies.
            </p>
            
            {/* Search and Filter */}
            <div className="max-w-2xl mx-auto mb-12">
              <SearchAndFilter
                onSearch={handleSearch}
                onFilter={handleFilter}
                categories={categories}
                showAdvanced={true}
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-${stat.color}-100 rounded-lg mb-3`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-emerald-800">Featured Courses</h2>
            <Link 
              to="/courses" 
              className="flex items-center text-emerald-600 hover:text-emerald-700 font-medium"
            >
              View all courses
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                onWishlistToggle={handleWishlistToggle}
                isWishlisted={false}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-emerald-800 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-emerald-600 max-w-2xl mx-auto">
              Experience the best in online learning with our comprehensive features designed for your success.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                  <feature.icon className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-emerald-800 mb-2">{feature.title}</h3>
                <p className="text-emerald-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-emerald-800 mb-4">
              Explore by Category
            </h2>
            <p className="text-lg text-emerald-600">
              Find courses in your area of interest
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map(category => (
              <Link
                key={category.id}
                to={`/courses?category=${category.id}`}
                className="group p-6 bg-white rounded-xl shadow-lg border border-emerald-100 text-center hover:shadow-xl transition-all duration-300"
              >
                <div 
                  className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: category.color }}
                >
                  <span className="text-white text-lg">{category.icon || '📚'}</span>
                </div>
                <h3 className="font-semibold text-emerald-800 group-hover:text-emerald-600 transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join thousands of learners who are already advancing their careers with our courses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Link
                  to="/register"
                  className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/courses"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition-colors"
                >
                  Browse Courses
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">E-Learn Platform</h3>
              <p className="text-gray-400">
                Empowering learners worldwide with quality education and innovative learning experiences.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/courses" className="hover:text-white transition-colors">Courses</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/courses?category=programming" className="hover:text-white transition-colors">Programming</Link></li>
                <li><Link to="/courses?category=design" className="hover:text-white transition-colors">Design</Link></li>
                <li><Link to="/courses?category=business" className="hover:text-white transition-colors">Business</Link></li>
                <li><Link to="/courses?category=marketing" className="hover:text-white transition-colors">Marketing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 E-Learn Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
