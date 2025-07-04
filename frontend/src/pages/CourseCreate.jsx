import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  PhotoIcon, 
  VideoCameraIcon, 
  DocumentTextIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  CloudArrowUpIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TagIcon,
  AcademicCapIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

export default function CourseCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');
  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    description: '',
    price: 0,
    original_price: '',
    category: '',
    difficulty: 'beginner',
    language: 'English',
    video_intro: '',
    requirements: [''],
    learning_outcomes: [''],
    tags: [''],
    status: 'draft',
    slug: ''
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [modules, setModules] = useState([
    // Example: { title: '', description: '', order: 1, lessons: [ { title: '', content: '', ... } ] }
  ]);

  const steps = [
    { id: 1, name: 'Basic Info', icon: DocumentTextIcon },
    { id: 2, name: 'Modules', icon: BookOpenIcon },
    { id: 3, name: 'Media & Settings', icon: PhotoIcon },
    { id: 4, name: 'Pricing', icon: CurrencyDollarIcon },
    { id: 5, name: 'Requirements & Outcomes', icon: AcademicCapIcon },
    { id: 6, name: 'Review & Publish', icon: CheckCircleIcon }
  ];

  useEffect(() => {
    fetchCategories();
    // Auto-save every 30 seconds
    const interval = setInterval(autoSave, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (formData.title.trim()) {
      setAutoSaveStatus('saving');
      try {
        // Save to localStorage as draft
        localStorage.setItem('courseDraft', JSON.stringify(formData));
        setAutoSaveStatus('saved');
      } catch (error) {
        setAutoSaveStatus('error');
      }
    }
  }, [formData]);

  // Load draft from localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem('courseDraft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setFormData(prev => ({ ...prev, ...draft }));
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Auto-generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate slug from title
    if (name === 'title') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        slug: generateSlug(value)
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayFieldChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.short_description.trim()) newErrors.short_description = 'Short description is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (formData.price < 0) newErrors.price = 'Price cannot be negative';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setCurrentStep(1);
      return;
    }

    setLoading(true);
    setAutoSaveStatus('saving');

    try {
      const courseData = new FormData();
      
      // Add basic fields
      Object.keys(formData).forEach(key => {
        if (key === 'requirements' || key === 'learning_outcomes' || key === 'tags') {
          courseData.append(key, JSON.stringify(formData[key].filter(item => item.trim() !== '')));
        } else {
          courseData.append(key, formData[key]);
        }
      });

      // Add thumbnail
      if (thumbnail) {
        courseData.append('thumbnail', thumbnail);
      }

      // 1. Create course
      const courseRes = await api.post('/api/courses/', courseData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const courseId = courseRes.data.id;

      // 2. Create modules
      for (const [modIdx, mod] of modules.entries()) {
        const modRes = await api.post('/api/modules/', { ...mod, course: courseId });
        const moduleId = modRes.data.id;

        // 3. Create lessons for this module
        for (const lesson of mod.lessons) {
          await api.post('/api/lessons/', { ...lesson, module: moduleId });
        }
      }

      // Clear draft from localStorage
      localStorage.removeItem('courseDraft');
      
      navigate(`/courses/${courseId}/edit`);
    } catch (error) {
      console.error('Error creating course:', error);
      setAutoSaveStatus('error');
      alert('Error creating course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Module handlers
  const addModule = () => {
    setModules(prev => ([...prev, { title: '', description: '', order: prev.length + 1, lessons: [] }]));
  };
  const updateModule = (idx, field, value) => {
    setModules(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));
  };
  const removeModule = (idx) => {
    setModules(prev => prev.filter((_, i) => i !== idx));
  };

  // Lesson handlers (per module)
  const addLesson = (modIdx) => {
    setModules(prev => prev.map((m, i) => i === modIdx ? { ...m, lessons: [...m.lessons, { title: '', content: '', order: m.lessons.length + 1, lesson_type: 'video' }] } : m));
  };
  const updateLesson = (modIdx, lesIdx, field, value) => {
    setModules(prev => prev.map((m, i) => i === modIdx ? { ...m, lessons: m.lessons.map((l, j) => j === lesIdx ? { ...l, [field]: value } : l) } : m));
  };
  const removeLesson = (modIdx, lesIdx) => {
    setModules(prev => prev.map((m, i) => i === modIdx ? { ...m, lessons: m.lessons.filter((_, j) => j !== lesIdx) } : m));
  };

  if (user?.role !== 'instructor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Only instructors can create courses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard2')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
                <p className="text-sm text-gray-600">Build your course step by step</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <ClockIcon className="h-4 w-4" />
              <span>
                {autoSaveStatus === 'saving' && 'Saving...'}
                {autoSaveStatus === 'saved' && 'All changes saved'}
                {autoSaveStatus === 'error' && 'Save failed'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 py-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center space-x-2 ${currentStep >= step.id ? 'text-purple-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep > step.id ? 'bg-purple-600 text-white' :
                    currentStep === step.id ? 'bg-purple-100 text-purple-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="hidden sm:block font-medium">{step.name}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`ml-8 h-px w-8 ${currentStep > step.id ? 'bg-purple-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <form onSubmit={handleSubmit} className="p-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    Basic Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                          errors.title ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter an engaging course title"
                      />
                      {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                      <p className="text-sm text-gray-500 mt-1">
                        {formData.title.length}/100 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Short Description *
                      </label>
                      <textarea
                        name="short_description"
                        value={formData.short_description}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        maxLength={200}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                          errors.short_description ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Brief description that appears in course cards"
                      />
                      {errors.short_description && <p className="text-red-500 text-sm mt-1">{errors.short_description}</p>}
                      <p className="text-sm text-gray-500 mt-1">
                        {formData.short_description.length}/200 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Detailed Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                          errors.description ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Provide a comprehensive description of your course"
                      />
                      {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                      <p className="text-sm text-gray-500 mt-1">
                        {formData.description.length}/2000 characters
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Modules */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-emerald-800 mb-4 flex items-center"><BookOpenIcon className="h-6 w-6 mr-2" />Modules & Lessons</h2>
                {modules.map((mod, modIdx) => (
                  <div key={modIdx} className="bg-white rounded-lg shadow p-4 mb-6 border border-emerald-100">
                    <div className="flex items-center mb-2">
                      <input
                        type="text"
                        placeholder="Module Title"
                        value={mod.title}
                        onChange={e => updateModule(modIdx, 'title', e.target.value)}
                        className="mr-2 px-3 py-2 border rounded w-1/2"
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={mod.description}
                        onChange={e => updateModule(modIdx, 'description', e.target.value)}
                        className="mr-2 px-3 py-2 border rounded w-1/2"
                      />
                      <button onClick={() => removeModule(modIdx)} className="ml-2 text-red-500"><XMarkIcon className="h-5 w-5" /></button>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold mb-2">Lessons</h4>
                      {mod.lessons.map((les, lesIdx) => (
                        <div key={lesIdx} className="flex items-center mb-2">
                          <input
                            type="text"
                            placeholder="Lesson Title"
                            value={les.title}
                            onChange={e => updateLesson(modIdx, lesIdx, 'title', e.target.value)}
                            className="mr-2 px-3 py-2 border rounded w-1/3"
                          />
                          <input
                            type="text"
                            placeholder="Content"
                            value={les.content}
                            onChange={e => updateLesson(modIdx, lesIdx, 'content', e.target.value)}
                            className="mr-2 px-3 py-2 border rounded w-1/2"
                          />
                          <select
                            value={les.lesson_type}
                            onChange={e => updateLesson(modIdx, lesIdx, 'lesson_type', e.target.value)}
                            className="mr-2 px-3 py-2 border rounded"
                          >
                            <option value="video">Video</option>
                            <option value="text">Text</option>
                            <option value="quiz">Quiz</option>
                            <option value="assignment">Assignment</option>
                            <option value="file">File</option>
                          </select>
                          <button onClick={() => removeLesson(modIdx, lesIdx)} className="text-red-500"><XMarkIcon className="h-5 w-5" /></button>
                        </div>
                      ))}
                      <button onClick={() => addLesson(modIdx)} className="mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded flex items-center"><PlusIcon className="h-4 w-4 mr-1" />Add Lesson</button>
                    </div>
                  </div>
                ))}
                <button onClick={addModule} className="px-4 py-2 bg-emerald-600 text-white rounded flex items-center"><PlusIcon className="h-5 w-5 mr-2" />Add Module</button>
              </div>
            )}

            {/* Step 3: Media & Settings */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <PhotoIcon className="h-5 w-5 mr-2" />
                    Media & Settings
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Thumbnail Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Course Thumbnail
                      </label>
                      <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                        <div className="flex-shrink-0">
                          {thumbnailPreview ? (
                            <div className="relative">
                              <img
                                src={thumbnailPreview}
                                alt="Thumbnail preview"
                                className="h-40 w-64 object-cover rounded-lg shadow-sm"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setThumbnail(null);
                                  setThumbnailPreview('');
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="h-40 w-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors">
                              <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500 text-center">Upload thumbnail</p>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailChange}
                            className="hidden"
                            id="thumbnail-upload"
                          />
                          <label
                            htmlFor="thumbnail-upload"
                            className="cursor-pointer inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            <PhotoIcon className="h-4 w-4 mr-2" />
                            Choose Image
                          </label>
                          <p className="text-sm text-gray-500 mt-2">
                            Recommended: 1280x720 pixels, JPG or PNG, max 5MB
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Video URL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Introduction Video URL
                      </label>
                      <div className="flex">
                        <VideoCameraIcon className="h-5 w-5 text-gray-400 mt-3 mr-2" />
                        <input
                          type="url"
                          name="video_intro"
                          value={formData.video_intro}
                          onChange={handleInputChange}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="YouTube or Vimeo URL (optional)"
                        />
                      </div>
                    </div>

                    {/* Settings Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            errors.category ? 'border-red-300' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select Category</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Difficulty Level
                        </label>
                        <select
                          name="difficulty"
                          value={formData.difficulty}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language
                        </label>
                        <input
                          type="text"
                          name="language"
                          value={formData.language}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="e.g., English"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Course Status
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </select>
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags
                      </label>
                      <div className="flex">
                        <TagIcon className="h-5 w-5 text-gray-400 mt-3 mr-2" />
                        <input
                          type="text"
                          name="tags"
                          value={formData.tags.join(', ')}
                          onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()) }))}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="e.g., python, web development, beginner"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Add keywords separated by commas to help students find your course
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Pricing */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                    Pricing
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price ($)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">$</span>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            errors.price ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="0.00"
                        />
                      </div>
                      {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                      <p className="text-sm text-gray-500 mt-1">
                        Set to 0 for free courses
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Original Price ($) - Optional
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">$</span>
                        <input
                          type="number"
                          name="original_price"
                          value={formData.original_price}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="For discounted courses"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Show the original price for discount campaigns
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Requirements & Outcomes */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <AcademicCapIcon className="h-5 w-5 mr-2" />
                    Requirements & Learning Outcomes
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Requirements */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">Requirements</h4>
                      <p className="text-sm text-gray-600 mb-4">What students need to know before taking this course</p>
                      {formData.requirements.map((requirement, index) => (
                        <div key={index} className="flex items-center space-x-3 mb-3">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          <input
                            type="text"
                            value={requirement}
                            onChange={(e) => handleArrayFieldChange(index, 'requirements', e.target.value)}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="e.g., Basic computer skills"
                          />
                          {formData.requirements.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArrayField('requirements', index)}
                              className="p-2 text-red-500 hover:text-red-700 transition-colors"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayField('requirements')}
                        className="flex items-center text-purple-600 hover:text-purple-700 transition-colors"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Requirement
                      </button>
                    </div>

                    {/* Learning Outcomes */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">Learning Outcomes</h4>
                      <p className="text-sm text-gray-600 mb-4">What students will learn from this course</p>
                      {formData.learning_outcomes.map((outcome, index) => (
                        <div key={index} className="flex items-center space-x-3 mb-3">
                          <BookOpenIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          <input
                            type="text"
                            value={outcome}
                            onChange={(e) => handleArrayFieldChange(index, 'learning_outcomes', e.target.value)}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="e.g., Build a complete web application"
                          />
                          {formData.learning_outcomes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArrayField('learning_outcomes', index)}
                              className="p-2 text-red-500 hover:text-red-700 transition-colors"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayField('learning_outcomes')}
                        className="flex items-center text-purple-600 hover:text-purple-700 transition-colors"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Learning Outcome
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Review & Publish */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Review & Publish
                  </h3>
                  
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Course Title</h4>
                        <p className="text-gray-600">{formData.title || 'Not set'}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Category</h4>
                        <p className="text-gray-600">
                          {categories.find(c => c.id == formData.category)?.name || 'Not set'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Price</h4>
                        <p className="text-gray-600">
                          ${formData.price} {formData.original_price && `(was $${formData.original_price})`}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Difficulty</h4>
                        <p className="text-gray-600 capitalize">{formData.difficulty}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Short Description</h4>
                      <p className="text-gray-600">{formData.short_description || 'Not set'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                      <ul className="text-gray-600 space-y-1">
                        {formData.requirements.filter(r => r.trim()).map((req, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Learning Outcomes</h4>
                      <ul className="text-gray-600 space-y-1">
                        {formData.learning_outcomes.filter(o => o.trim()).map((outcome, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                            {outcome}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard2')}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                
                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Course'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 