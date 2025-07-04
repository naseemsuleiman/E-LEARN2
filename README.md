# E-Learn Platform - Comprehensive LMS Solution

A fully functional Learning Management System (LMS) built with React frontend and Django backend, featuring modern UI/UX design and comprehensive learning features.

## 🚀 Features

### 🎓 Core Learning Features
- **Course Management**: Create, edit, and manage courses with rich content
- **Video Learning**: Support for video lessons with progress tracking
- **Interactive Quizzes**: AI-powered quiz generation and traditional quizzes
- **Progress Tracking**: Real-time progress monitoring with visual indicators
- **Certificates**: Automatic certificate generation upon course completion
- **Assignments**: Submit and grade assignments with feedback
- **Discussions**: Course-specific discussion forums for student interaction

### 👥 User Management
- **Multi-Role System**: Students, Instructors, and Administrators
- **User Profiles**: Comprehensive user profiles with avatars and bio
- **Authentication**: JWT-based authentication with refresh tokens
- **Role-Based Access**: Different dashboards and permissions per role

### 📊 Analytics & Insights
- **Instructor Dashboard**: Course performance, student analytics, revenue tracking
- **Student Dashboard**: Learning progress, achievements, course recommendations
- **Admin Dashboard**: Platform-wide analytics and user management
- **Progress Reports**: Detailed learning analytics and performance metrics

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Emerald Theme**: Consistent emerald/teal color scheme throughout
- **Interactive Components**: Hover effects, animations, and smooth transitions
- **Loading States**: Comprehensive loading spinners and skeleton screens
- **Error Handling**: User-friendly error messages and error boundaries

### 🔍 Advanced Features
- **Search & Filter**: Advanced course search with multiple filter options
- **Wishlist**: Save courses for later viewing
- **Learning Paths**: Structured learning sequences
- **Badges & Achievements**: Gamification elements for engagement
- **Notifications**: Real-time notifications for important events
- **File Upload**: Support for course materials and assignments

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **React Router**: Client-side routing with nested routes
- **Tailwind CSS**: Utility-first CSS framework
- **Heroicons**: Beautiful SVG icons
- **Axios**: HTTP client for API communication
- **Context API**: State management for authentication and notifications

### Backend
- **Django 5.2**: Python web framework
- **Django REST Framework**: API development
- **Django CORS Headers**: Cross-origin resource sharing
- **Simple JWT**: JWT authentication
- **Pillow**: Image processing for avatars and thumbnails
- **SQLite**: Database (can be easily switched to PostgreSQL)

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd E-LEARN2
   ```

2. **Navigate to backend directory**
   ```bash
   cd backend
   ```

3. **Create virtual environment**
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start the backend server**
   ```bash
   python manage.py runserver
   ```

The backend will be available at `http://127.0.0.1:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173` (or the next available port)

## 🎯 Usage Guide

### For Students

1. **Registration & Login**
   - Visit the homepage and click "Get Started Free"
   - Fill in your details and create an account
   - Log in with your credentials

2. **Browse Courses**
   - Use the search and filter options to find courses
   - View course details, instructor information, and reviews
   - Add courses to your wishlist

3. **Enroll in Courses**
   - Click "Enroll" on any course
   - Access course content through the course player
   - Track your progress and complete assignments

4. **Track Progress**
   - View your dashboard for overall progress
   - Check individual course progress
   - Earn certificates upon completion

### For Instructors

1. **Create Courses**
   - Access the instructor dashboard
   - Use the multi-step course creation form
   - Add modules, lessons, and assignments

2. **Manage Content**
   - Upload video content and course materials
   - Create quizzes and assignments
   - Monitor student progress and submissions

3. **Analytics**
   - View course performance metrics
   - Track student engagement and completion rates
   - Monitor revenue and earnings

### For Administrators

1. **User Management**
   - Manage all users and their roles
   - Monitor platform activity
   - Handle course approvals

2. **Platform Analytics**
   - View platform-wide statistics
   - Monitor system health
   - Generate reports

## 🔧 API Endpoints

### Authentication
- `POST /api/register/` - User registration
- `POST /api/login/` - User login
- `POST /api/token/refresh/` - Refresh JWT token

### Courses
- `GET /api/courses/` - List all courses
- `POST /api/courses/` - Create new course
- `GET /api/courses/{id}/` - Get course details
- `PUT /api/courses/{id}/` - Update course
- `DELETE /api/courses/{id}/` - Delete course

### Enrollments
- `POST /api/courses/{id}/enroll/` - Enroll in course
- `GET /api/enrollments/` - Get user enrollments

### Assignments
- `GET /api/assignments/` - List assignments
- `POST /api/assignments/{id}/submissions/` - Submit assignment

### Quizzes
- `POST /api/courses/{id}/ai-quiz/` - Generate AI quiz
- `POST /api/courses/{id}/ai-quiz/submit/` - Submit AI quiz

### Discussions
- `GET /api/courses/{id}/discussions/` - Get course discussions
- `POST /api/courses/{id}/discussions/` - Create discussion thread

## 🎨 UI Components

### Core Components
- `LoadingSpinner` - Reusable loading component
- `ErrorBoundary` - Error handling wrapper
- `Toast` - Notification system
- `CourseCard` - Course display card
- `SearchAndFilter` - Advanced search and filtering
- `ProgressTracker` - Learning progress visualization
- `AnalyticsDashboard` - Data visualization dashboard

### Pages
- `Home` - Landing page with course showcase
- `Dashboard` - Student dashboard
- `InstructorDashboard` - Instructor analytics
- `AdminDashboard` - Admin management
- `CourseDetail` - Course information and enrollment
- `CoursePlayer` - Video player and lesson navigation
- `Quiz` - Interactive quiz interface
- `Discussion` - Course discussion forum

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Different permissions per user role
- **Input Validation**: Comprehensive form validation
- **CORS Configuration**: Proper cross-origin resource sharing
- **Error Handling**: Secure error messages without sensitive data

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop computers (1200px+)
- Tablets (768px - 1199px)
- Mobile phones (320px - 767px)

## 🚀 Performance Optimizations

- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Compressed images with fallbacks
- **Code Splitting**: Bundle optimization
- **Caching**: API response caching
- **Debounced Search**: Optimized search performance

## 🧪 Testing

### Backend Testing
```bash
cd backend
python manage.py test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📈 Deployment

### Backend Deployment
1. Set up a production database (PostgreSQL recommended)
2. Configure environment variables
3. Run `python manage.py collectstatic`
4. Deploy to your preferred hosting service

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy the `dist` folder to your hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🎉 Acknowledgments

- Built with modern web technologies
- Inspired by popular LMS platforms like Udemy and Coursera
- Uses best practices for web development and user experience

---

**E-Learn Platform** - Empowering learners worldwide with quality education and innovative learning experiences. 