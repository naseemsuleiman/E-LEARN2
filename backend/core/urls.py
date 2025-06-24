# urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views
from .views import (
    EnrollmentView, InstructorDashboardView, CourseView, StudentCourseListView, instructor_stats,
    instructor_messages, AssignmentListCreateView, AssignmentDetailView, AssignmentSubmissionListCreateView,
    AssignmentSubmissionDetailView, AnnouncementListCreateView, AnnouncementDetailView, ProfileRetrieveUpdateView,
    ModuleListCreateView, ModuleDetailView, LessonListCreateView, LessonDetailView, NotificationListView,
    GradebookEntryListView, DiscussionThreadListCreateView, DiscussionPostListCreateView, ProgressListView,
    CertificateListView
)

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/instructor/dashboard/', views.InstructorDashboardView.as_view(), name='instructor-dashboard'),
    path('api/courses/', CourseView.as_view()),
    path('api/courses/<int:pk>/', CourseView.as_view()),
    path('api/enroll/<int:course_id>/', EnrollmentView.as_view(), name='enroll'),
    path('api/student/courses/', StudentCourseListView.as_view()),
    path('api/instructor/stats/', views.instructor_stats, name='instructor_stats'),
    path('api/instructor/messages/', views.instructor_messages, name='instructor_messages'),
    path('api/assignments/', AssignmentListCreateView.as_view(), name='assignment-list-create'),
    path('api/assignments/<int:pk>/', AssignmentDetailView.as_view(), name='assignment-detail'),
    path('api/assignments/<int:assignment_id>/submissions/', AssignmentSubmissionListCreateView.as_view(), name='assignment-submission-list-create'),
    path('api/submissions/<int:pk>/', AssignmentSubmissionDetailView.as_view(), name='assignment-submission-detail'),
    path('api/announcements/', AnnouncementListCreateView.as_view(), name='announcement-list-create'),
    path('api/announcements/<int:pk>/', AnnouncementDetailView.as_view(), name='announcement-detail'),
    path('api/profile/', ProfileRetrieveUpdateView.as_view(), name='profile'),
    path('api/modules/', ModuleListCreateView.as_view(), name='module-list-create'),
    path('api/modules/<int:pk>/', ModuleDetailView.as_view(), name='module-detail'),
    path('api/modules/<int:module_id>/lessons/', LessonListCreateView.as_view(), name='lesson-list-create'),
    path('api/lessons/<int:pk>/', LessonDetailView.as_view(), name='lesson-detail'),
    path('api/notifications/', NotificationListView.as_view(), name='notification-list'),
    path('api/gradebook/', GradebookEntryListView.as_view(), name='gradebook-list'),
    path('api/courses/<int:course_id>/discussions/', DiscussionThreadListCreateView.as_view(), name='discussion-thread-list-create'),
    path('api/discussions/<int:thread_id>/posts/', DiscussionPostListCreateView.as_view(), name='discussion-post-list-create'),
    path('api/progress/', ProgressListView.as_view(), name='progress-list'),
    path('api/certificates/', CertificateListView.as_view(), name='certificate-list'),
]