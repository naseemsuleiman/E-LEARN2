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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    requirements: [''],
    outcomes: [''],
    difficulty: 'beginner',
    thumbnail: null
  });
  const [modules, setModules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  const steps = [
    { id: 1, name: 'Basic Info' },
    { id: 2, name: 'Curriculum' },
    { id: 3, name: 'Publish' }
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories/');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (modules.length === 0) newErrors.modules = 'At least one module is required';
    
    modules.forEach((mod, modIdx) => {
      if (!mod.title.trim()) newErrors.modules = `Module ${modIdx + 1} needs a title`;
      if (mod.lessons.length === 0) newErrors.modules = `Module ${modIdx + 1} needs at least one lesson`;
      
      mod.lessons.forEach((les, lesIdx) => {
        if (!les.title.trim()) newErrors.modules = `Lesson ${lesIdx + 1} in Module ${modIdx + 1} needs a title`;
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const courseData = new FormData();
      courseData.append('title', formData.title);
      courseData.append('description', formData.description);
      courseData.append('category', formData.category);
      courseData.append('price', formData.price);
      courseData.append('difficulty', formData.difficulty);
      courseData.append('requirements', JSON.stringify(formData.requirements.filter(r => r.trim())));
      courseData.append('outcomes', JSON.stringify(formData.outcomes.filter(o => o.trim())));
      if (formData.thumbnail) courseData.append('thumbnail', formData.thumbnail);

      const courseResponse = await api.post('/api/courses/', courseData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${user?.access}`,
        },
      });

      const courseId = courseResponse.data.id;

      // Create modules and lessons
      for (const module of modules) {
        const moduleRes = await api.post('/api/modules/', {
          title: module.title,
          course: courseId,
          order: module.order
        }, {
          headers: {
            'Authorization': `Bearer ${user?.access}`,
          }
        });

        for (const lesson of module.lessons) {
          await api.post('/api/lessons/', {
            title: lesson.title,
            content: lesson.content,
            lesson_type: lesson.lesson_type,
            module: moduleRes.data.id,
            order: lesson.order
          }, {
            headers: {
              'Authorization': `Bearer ${user?.access}`,
            }
          });
        }
      }

      navigate(`/courses/${courseId}`);
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Error creating course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e) => {
    if (e.target.files[0]) {
      setFormData(prev => ({ ...prev, thumbnail: e.target.files[0] }));
    }
  };

  const addModule = () => {
    setModules(prev => ([...prev, { 
      title: '', 
      order: prev.length + 1, 
      lessons: [{ title: '', content: '', lesson_type: 'video', order: 1 }] 
    }]));
  };

  const updateModule = (idx, field, value) => {
    setModules(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));
  };

  const removeModule = (idx) => {
    setModules(prev => prev.filter((_, i) => i !== idx));
  };

  const addLesson = (modIdx) => {
    setModules(prev => prev.map((m, i) => i === modIdx ? { 
      ...m, 
      lessons: [...m.lessons, { 
        title: '', 
        content: '', 
        lesson_type: 'video', 
        order: m.lessons.length + 1 
      }] 
    } : m));
  };

  const updateLesson = (modIdx, lesIdx, field, value) => {
    setModules(prev => prev.map((m, i) => i === modIdx ? { 
      ...m, 
      lessons: m.lessons.map((l, j) => j === lesIdx ? { ...l, [field]: value } : l) 
    } : m));
  };

  const removeLesson = (modIdx, lesIdx) => {
    setModules(prev => prev.map((m, i) => i === modIdx ? { 
      ...m, 
      lessons: m.lessons.filter((_, j) => j !== lesIdx) 
    } : m));
  };

  const handleArrayField = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayField = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
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
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              Back
            </button>
            <h1 className="text-xl font-bold text-gray-900">Create New Course</h1>
            <div className="text-sm text-gray-500">
              Step {currentStep} of {steps.length}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= step.id ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.id}
                </div>
                <span className={`mt-2 text-sm ${
                  currentStep >= step.id ? 'text-purple-600 font-medium' : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Course title"
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-2 border rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Course description"
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Thumbnail</label>
                  <div className="flex items-center space-x-4">
                    {formData.thumbnail ? (
                      <div className="relative">
                        <img 
                          src={URL.createObjectURL(formData.thumbnail)} 
                          alt="Thumbnail preview" 
                          className="h-20 w-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, thumbnail: null }))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        <PhotoIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        id="thumbnail-upload"
                        onChange={handleThumbnailChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <label
                        htmlFor="thumbnail-upload"
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer"
                      >
                        Choose Image
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Recommended: 1280x720 pixels</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Curriculum */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Course Curriculum</h3>
                {errors.modules && <p className="text-red-500 text-sm">{errors.modules}</p>}

                {modules.map((module, modIdx) => (
                  <div key={modIdx} className="border rounded-lg p-4">
                    <div className="flex items-center mb-4">
                      <input
                        type="text"
                        value={module.title}
                        onChange={(e) => updateModule(modIdx, 'title', e.target.value)}
                        placeholder="Module title *"
                        className={`flex-1 px-3 py-2 border rounded ${errors.modules?.includes(`Module ${modIdx + 1}`) ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeModule(modIdx)}
                        className="ml-2 text-red-500 p-1"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="ml-4 space-y-3">
                      {module.lessons.map((lesson, lesIdx) => (
                        <div key={lesIdx} className="bg-gray-50 p-3 rounded">
                          <div className="flex items-center">
                            <input
                              type="text"
                              value={lesson.title}
                              onChange={(e) => updateLesson(modIdx, lesIdx, 'title', e.target.value)}
                              placeholder="Lesson title *"
                              className={`flex-1 px-3 py-1 border rounded ${errors.modules?.includes(`Lesson ${lesIdx + 1}`) ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            <select
                              value={lesson.lesson_type}
                              onChange={(e) => updateLesson(modIdx, lesIdx, 'lesson_type', e.target.value)}
                              className="ml-2 px-2 py-1 border rounded"
                            >
                              <option value="video">Video</option>
                              <option value="text">Text</option>
                              <option value="quiz">Quiz</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => removeLesson(modIdx, lesIdx)}
                              className="ml-2 text-red-500 p-1"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                          <textarea
                            value={lesson.content}
                            onChange={(e) => updateLesson(modIdx, lesIdx, 'content', e.target.value)}
                            placeholder="Lesson content"
                            rows={2}
                            className="w-full px-3 py-1 border rounded mt-2"
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addLesson(modIdx)}
                        className="flex items-center text-sm text-purple-600"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Lesson
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addModule}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg"
                >
                  <PlusIcon className="h-5 w-5 mr-1" />
                  Add Module
                </button>
              </div>
            )}

            {/* Step 3: Publish */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Final Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2">$</span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full pl-8 pr-4 py-2 border rounded-lg"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                    <div className="space-y-2">
                      {formData.requirements.map((req, idx) => (
                        <div key={idx} className="flex items-center">
                          <input
                            type="text"
                            value={req}
                            onChange={(e) => handleArrayField('requirements', idx, e.target.value)}
                            className="flex-1 px-3 py-1 border rounded"
                            placeholder="Requirement"
                          />
                          {formData.requirements.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArrayField('requirements', idx)}
                              className="ml-2 text-red-500 p-1"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayField('requirements')}
                        className="text-sm text-purple-600 flex items-center"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Requirement
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Learning Outcomes</label>
                  <div className="space-y-2">
                    {formData.outcomes.map((outcome, idx) => (
                      <div key={idx} className="flex items-center">
                        <input
                          type="text"
                          value={outcome}
                          onChange={(e) => handleArrayField('outcomes', idx, e.target.value)}
                          className="flex-1 px-3 py-1 border rounded"
                          placeholder="Outcome"
                        />
                        {formData.outcomes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayField('outcomes', idx)}
                            className="ml-2 text-red-500 p-1"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayField('outcomes')}
                      className="text-sm text-purple-600 flex items-center"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Outcome
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Course Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Title: {formData.title || 'Not set'}</p>
                      <p className="text-gray-600">Category: {categories.find(c => c.id == formData.category)?.name || 'Not set'}</p>
                      <p className="text-gray-600">Price: ${formData.price}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Modules: {modules.length}</p>
                      <p className="text-gray-600">Lessons: {modules.reduce((acc, mod) => acc + mod.lessons.length, 0)}</p>
                      <p className="text-gray-600">Difficulty: {formData.difficulty}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-4 border-t">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
              ) : (
                <div></div>
              )}

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Publishing...' : 'Publish Course'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}