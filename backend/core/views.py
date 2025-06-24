from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import generics
from django.contrib.auth import authenticate, get_user_model
from .models import Course, Enrollment, CustomUser, Message, Assignment, AssignmentSubmission, Announcement, Profile, Module, Lesson, Notification, GradebookEntry, DiscussionThread, DiscussionPost, Progress, Certificate
from .serializers import (
    CourseSerializer,
    EnrollmentSerializer,
    RegisterSerializer,
    LoginSerializer,
    AssignmentSerializer,
    AssignmentSubmissionSerializer,
    AnnouncementSerializer,
    ProfileSerializer,
    MessageSerializer,
    ModuleSerializer,
    LessonSerializer,
    NotificationSerializer,
    GradebookEntrySerializer,
    DiscussionThreadSerializer,
    DiscussionPostSerializer,
    ProgressSerializer,
    CertificateSerializer,
    UserSerializer,
)

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': serializer.data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            role = 'admin' if user.is_superuser else user.role
            return Response({
                'id': user.id,
                'username': user.username,
                'role': role,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class CourseView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        if pk:
            course = Course.objects.get(pk=pk)
            serializer = CourseSerializer(course)
            return Response(serializer.data)
        else:
            courses = Course.objects.all()
            serializer = CourseSerializer(courses, many=True)
            return Response(serializer.data)

    def post(self, request):
        serializer = CourseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(instructor=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        course = Course.objects.get(pk=pk)
        serializer = CourseSerializer(course, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        course = Course.objects.get(pk=pk)
        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CourseCreateView(generics.CreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)


class EnrollmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        course = Course.objects.get(id=course_id)
        if Enrollment.objects.filter(student=request.user, course=course).exists():
            return Response({"error": "Already enrolled."}, status=status.HTTP_400_BAD_REQUEST)
        Enrollment.objects.create(student=request.user, course=course)
        return Response({"message": "Enrolled successfully."}, status=status.HTTP_201_CREATED)

    def get(self, request, course_id):
        enrollment = Enrollment.objects.filter(student=request.user, course_id=course_id).first()
        if enrollment:
            serializer = EnrollmentSerializer(enrollment)
            return Response(serializer.data)
        return Response({"error": "Not enrolled."}, status=status.HTTP_404_NOT_FOUND)

class InstructorDashboardView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            if not hasattr(request.user, 'role') or request.user.role != "instructor":
                return Response({"error": "Only instructors can access this dashboard."},
                                status=status.HTTP_403_FORBIDDEN)

            courses = Course.objects.filter(instructor=request.user)
            course_serializer = CourseSerializer(courses, many=True)

            # List enrolled students for each course
            course_students = {}
            for course in courses:
                enrollments = Enrollment.objects.filter(course=course)
                students = [UserSerializer(e.student).data for e in enrollments]
                course_students[course.id] = students

            students_count = Enrollment.objects.filter(course__in=courses).values('student').distinct().count()
            revenue = sum([c.price for c in courses])
            earnings = [
                {"month": "Jan", "amount": 500},
                {"month": "Feb", "amount": 700},
                {"month": "Mar", "amount": 800},
            ]
            stats = {
                "students": students_count,
                "revenue": revenue,
                "earnings": earnings,
            }

            messages = Message.objects.filter(instructor=request.user).order_by('-created_at')[:10]
            message_data = [
                {
                    "id": msg.id,
                    "sender": msg.sender.username,
                    "content": msg.content,
                    "created_at": msg.created_at,
                } for msg in messages
            ]

            return Response({
                "courses": course_serializer.data,
                "stats": stats,
                "messages": message_data,
                "course_students": course_students,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StudentCourseListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Return only courses the student is enrolled in
        enrollments = Enrollment.objects.filter(student=request.user)
        courses = [enrollment.course for enrollment in enrollments]
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def instructor_stats(request):
    user = request.user
    courses = Course.objects.filter(instructor=user)
    students = Enrollment.objects.filter(course__in=courses).values('student').distinct().count()
    revenue = sum([c.price for c in courses])
    earnings = [
        {"month": "Jan", "amount": 500},
        {"month": "Feb", "amount": 700},
        {"month": "Mar", "amount": 800},
    ]
    return Response({
        "students": students,
        "revenue": revenue,
        "earnings": earnings,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def instructor_messages(request):
    user = request.user
    messages = Message.objects.filter(instructor=user).order_by('-created_at')[:10]
    data = [
        {
            "id": msg.id,
            "sender": msg.sender.username,
            "content": msg.content,
            "created_at": msg.created_at,
        }
        for msg in messages
    ]
    return Response(data)

# Assignment Views
class AssignmentListCreateView(generics.ListCreateAPIView):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

class AssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

# Assignment Submission Views
class AssignmentSubmissionListCreateView(generics.ListCreateAPIView):
    queryset = AssignmentSubmission.objects.all()
    serializer_class = AssignmentSubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        assignment_id = self.kwargs.get('assignment_id')
        return AssignmentSubmission.objects.filter(assignment_id=assignment_id)

    def perform_create(self, serializer):
        assignment_id = self.kwargs.get('assignment_id')
        serializer.save(student=self.request.user, assignment_id=assignment_id)

class AssignmentSubmissionDetailView(generics.RetrieveUpdateAPIView):
    queryset = AssignmentSubmission.objects.all()
    serializer_class = AssignmentSubmissionSerializer
    permission_classes = [IsAuthenticated]

# Announcement Views
class AnnouncementListCreateView(generics.ListCreateAPIView):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class AnnouncementDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticated]

# Profile Views
class ProfileRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.profile

# Module Views
class ModuleListCreateView(generics.ListCreateAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [IsAuthenticated]

class ModuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [IsAuthenticated]

# Lesson Views
class LessonListCreateView(generics.ListCreateAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        module_id = self.kwargs.get('module_id')
        return Lesson.objects.filter(module_id=module_id)

class LessonDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

# Notification Views
class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

# Gradebook Views
class GradebookEntryListView(generics.ListAPIView):
    serializer_class = GradebookEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return GradebookEntry.objects.filter(student=self.request.user)

# Discussion Views
class DiscussionThreadListCreateView(generics.ListCreateAPIView):
    serializer_class = DiscussionThreadSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        return DiscussionThread.objects.filter(course_id=course_id)

    def perform_create(self, serializer):
        course_id = self.kwargs.get('course_id')
        serializer.save(created_by=self.request.user, course_id=course_id)

class DiscussionPostListCreateView(generics.ListCreateAPIView):
    serializer_class = DiscussionPostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        thread_id = self.kwargs.get('thread_id')
        return DiscussionPost.objects.filter(thread_id=thread_id)

    def perform_create(self, serializer):
        thread_id = self.kwargs.get('thread_id')
        serializer.save(author=self.request.user, thread_id=thread_id)

# Progress Views
class ProgressListView(generics.ListAPIView):
    serializer_class = ProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Progress.objects.filter(student=self.request.user)

# Certificate Views
class CertificateListView(generics.ListAPIView):
    serializer_class = CertificateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Certificate.objects.filter(student=self.request.user)
