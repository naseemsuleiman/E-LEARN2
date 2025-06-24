# urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views
from .views import (EnrollmentView, InstructorDashboardView, CourseView, StudentCourseListView,  instructor_stats,
    instructor_messages)

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
]