# urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views
from .views import (
    EnrollmentView, InstructorDashboardView, CourseView, StudentCourseListView, instructor_stats,
    instructor_messages, AssignmentListCreateView, AssignmentDetailView, AssignmentSubmissionListCreateView,
    AssignmentSubmissionDetailView, AnnouncementListCreateView, AnnouncementDetailView, ProfileRetrieveUpdateView,
    ModuleListCreateView, ModuleDetailView, LessonListCreateView, LessonDetailView, NotificationListView,
    NotificationCreateView, DiscussionThreadListCreateView, DiscussionPostListCreateView, ProgressListView,
    CertificateListView, LessonAssignmentsView, ProgressView, CourseStudentsView, LoginView, GeminiQuizGenerateView,
    MessageListCreateView, MessageThreadView, LessonNoteView, CourseAssignmentsView,
)

urlpatterns = [
    path('api/register/', views.RegisterView.as_view(), name='register'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Categories
    path('api/categories/', views.CategoryListCreateView.as_view(), name='category-list-create'),
    path('api/categories/<int:pk>/', views.CategoryDetailView.as_view(), name='category-detail'),
    
    # Courses
    path('api/courses/', CourseView.as_view(), name='course-list-create'),  # GET all / POST
    path('api/courses/<int:pk>/', CourseView.as_view(), name='course-detail'),  # GET one / PUT / DELETE

    path('api/courses/<int:course_id>/enroll/', EnrollmentView.as_view(), name='enroll'),
    path('api/courses/<int:course_id>/students/', CourseStudentsView.as_view(), name='course-students'),
    path('api/courses/<int:course_id>/progress/', views.CourseProgressView.as_view(), name='course-progress'),
    path('api/courses/<int:course_id>/lessons/', views.CourseLessonsView.as_view(), name='course-lessons'),
    
    # Enrollments
    path('api/enrollments/', views.EnrollmentListView.as_view(), name='enrollment-list'),
    path('api/enroll/<int:course_id>/', EnrollmentView.as_view(), name='enroll'),
    
    # Student Dashboard
    path('api/student/courses/', StudentCourseListView.as_view()),
    path('api/student/dashboard/', views.StudentDashboardView.as_view(), name='student-dashboard'),
    
    # Instructor Dashboard
    path('api/instructor/dashboard/', views.InstructorDashboardView.as_view(), name='instructor-dashboard'),
    path('api/instructor/stats/', views.instructor_stats, name='instructor_stats'),
    path('api/instructor/messages/', views.instructor_messages, name='instructor_messages'),
    
    # Assignments
    path('api/assignments/', AssignmentListCreateView.as_view(), name='assignment-list-create'),
    path('api/assignments/<int:pk>/', AssignmentDetailView.as_view(), name='assignment-detail'),
    path('api/assignments/<int:assignment_id>/submissions/', AssignmentSubmissionListCreateView.as_view(), name='assignment-submission-list-create'),
    path('api/submissions/<int:pk>/', AssignmentSubmissionDetailView.as_view(), name='assignment-submission-detail'),
    
    # Announcements
    path('api/announcements/', AnnouncementListCreateView.as_view(), name='announcement-list-create'),
    path('api/announcements/<int:pk>/', AnnouncementDetailView.as_view(), name='announcement-detail'),
    
    # Profile
    path('api/profile/', ProfileRetrieveUpdateView.as_view(), name='profile'),
    
    # Modules and Lessons
    path('api/modules/', ModuleListCreateView.as_view(), name='module-list-create'),
    path('api/modules/<int:pk>/', ModuleDetailView.as_view(), name='module-detail'),
    path('api/modules/<int:module_id>/lessons/', LessonListCreateView.as_view(), name='module-lesson-list-create'),
    path('api/lessons/', LessonListCreateView.as_view(), name='lesson-list'),
    path('api/lessons/<int:pk>/', LessonDetailView.as_view(), name='lesson-detail'),
    path('api/lessons/<int:lesson_id>/progress/', views.LessonProgressUpdateView.as_view(), name='lesson-progress'),
    path('lessons/<int:lesson_id>/assignments/', LessonAssignmentsView.as_view(), name='lesson-assignments'),
    path('api/lessons/<int:lesson_id>/notes/', LessonNoteView.as_view(), name='lesson-notes'),
    

    
    # Notifications
    path('api/notifications/', NotificationListView.as_view(), name='notification-list'),
    path('api/notifications/create/', NotificationCreateView.as_view(), name='notification-create'),
    
    # Discussions
    path('api/courses/<int:course_id>/discussions/', DiscussionThreadListCreateView.as_view(), name='discussion-thread-list-create'),
    path('api/discussions/<int:thread_id>/posts/', DiscussionPostListCreateView.as_view(), name='discussion-post-list-create'),
    
    # Progress
    path('api/progress/', ProgressListView.as_view(), name='progress-list'),
    path('api/progress/mark/', ProgressView.as_view(), name='progress-mark'),
    
    # Certificates
    path('api/certificates/', CertificateListView.as_view(), name='certificate-list'),
    
    # Gradebook
    path('api/gradebook/', views.GradebookListView.as_view(), name='gradebook-list'),
    
    # Quizzes
    path('api/quizzes/', views.QuizListCreateView.as_view(), name='quiz-list-create'),
    path('api/quizzes/<int:pk>/', views.QuizDetailView.as_view(), name='quiz-detail'),
    path('api/quizzes/<int:quiz_id>/attempts/', views.QuizAttemptCreateView.as_view(), name='quiz-attempt-create'),
    path('api/quiz-attempts/<int:attempt_id>/submit/', views.QuizAttemptSubmitView.as_view(), name='quiz-attempt-submit'),
    
    # AI Quiz
    path('api/gemini-quiz/', GeminiQuizGenerateView.as_view(), name='gemini-quiz-generate'),
    
    # Questions
    path('api/questions/', views.QuestionListCreateView.as_view(), name='question-list-create'),
    path('api/questions/<int:pk>/', views.QuestionDetailView.as_view(), name='question-detail'),
    
    # Wishlist
    path('api/wishlist/', views.WishlistListView.as_view(), name='wishlist-list'),
    path('api/wishlist/<int:course_id>/', views.WishlistDetailView.as_view(), name='wishlist-detail'),
    
    # Learning Paths
    path('api/learning-paths/', views.LearningPathListCreateView.as_view(), name='learning-path-list-create'),
    path('api/learning-paths/<int:pk>/', views.LearningPathDetailView.as_view(), name='learning-path-detail'),
    
    # Course Ratings
    path('api/courses/<int:course_id>/ratings/', views.CourseRatingListCreateView.as_view(), name='course-rating-list-create'),
    path('api/ratings/<int:pk>/', views.CourseRatingDetailView.as_view(), name='course-rating-detail'),
    
    # Badges
    path('api/badges/', views.BadgeListView.as_view(), name='badge-list'),
    path('api/user-badges/', views.UserBadgeListView.as_view(), name='user-badge-list'),
    
    # Payments
    path('api/payments/', views.PaymentListCreateView.as_view(), name='payment-list-create'),
    path('api/payments/<int:pk>/', views.PaymentDetailView.as_view(), name='payment-detail'),
    
    path('api/messages/', MessageListCreateView.as_view(), name='message-list-create'),
    path('api/messages/<int:user_id>/', MessageThreadView.as_view(), name='message-thread'),
    


    path('api/courses/<int:course_id>/assignments/', CourseAssignmentsView.as_view(), name='course-assignments'),


]