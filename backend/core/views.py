from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import generics
from django.contrib.auth import authenticate, get_user_model
from .models import (
    Course, Enrollment, CustomUser, Message, Assignment, AssignmentSubmission, Announcement, 
    Module, Lesson, Notification, DiscussionThread, DiscussionPost, Progress, Certificate,
    Category, Quiz, Question, QuestionOption, QuizAttempt, QuizResponse, LessonProgress,
    Badge, UserBadge, Payment, CourseRating, Wishlist, LearningPath
)
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
    DiscussionThreadSerializer,
    DiscussionPostSerializer,
    ProgressSerializer,
    CertificateSerializer,
    UserSerializer,
    CategorySerializer,
    QuizSerializer,
    QuestionSerializer,
    QuizAttemptSerializer,
    QuizResponseSerializer,
    LessonProgressSerializer,
    BadgeSerializer,
    UserBadgeSerializer,
    PaymentSerializer,
    CourseRatingSerializer,
    WishlistSerializer,
    LearningPathSerializer,
    CourseCreateSerializer

)
from rest_framework.decorators import action
from django.db.models import Sum
from django.db.models.functions import TruncMonth
from rest_framework.parsers import MultiPartParser, FormParser
import google.generativeai as genai
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models
import json

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()  # type: ignore[assignment]  # serializer.save() returns CustomUser
            if user is not None:
                refresh = RefreshToken.for_user(user)  # type: ignore[arg-type]
                return Response({
                    'user': serializer.data,
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({'error': 'User creation failed.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data  # type: ignore[assignment]
            # If LoginSerializer returns a user instance, this is fine. If not, re-authenticate here:
            if isinstance(user, dict):
                user = authenticate(username=user.get('username'), password=user.get('password'))
            if user is not None and hasattr(user, 'id'):
                refresh = RefreshToken.for_user(user)  # type: ignore[arg-type]
                role = 'admin' if getattr(user, 'is_superuser', False) else getattr(user, 'role', None)
                return Response({
                    'id': user.id,  # type: ignore[attr-defined]
                    'username': user.username,  # type: ignore[attr-defined]
                    'role': role,
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Invalid user.'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class CourseView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request, pk=None):
        if pk is not None:
            try:
                course = Course.objects.get(pk=pk)
                serializer = CourseSerializer(course, context={'request': request})
                return Response(serializer.data)
            except Course.DoesNotExist:
                return Response({"error": "Course not found."}, status=404)
        else:
            courses = Course.objects.all()
            serializer = CourseSerializer(courses, many=True, context={'request': request})
            return Response(serializer.data)
    def post(self, request):
        print("📨 Incoming raw data:", request.data)

        modules_raw = request.data.get('modules')
        if modules_raw and isinstance(modules_raw, str):
            try:
                modules_data = json.loads(modules_raw)
            except json.JSONDecodeError:
                print("❌ Failed to parse modules JSON")
                return Response({"modules": ["Invalid JSON format."]}, status=status.HTTP_400_BAD_REQUEST)
        else:
            modules_data = modules_raw or []

        serializer = CourseSerializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            course = serializer.save(instructor=request.user)
            print("✅ Course created:", course.title)

            for module_data in modules_data:
                module = Module.objects.create(
                    course=course,
                    title=module_data.get('title', 'Untitled Module'),
                    description=module_data.get('description', ''),
                    order=module_data.get('order', 1)
                )
                print(f"📦 Module created: {module.title}")

                for lesson_data in module_data.get('lessons', []):
                    Lesson.objects.create(
                        module=module,
                        title=lesson_data.get('title', 'Untitled Lesson'),
                        content=lesson_data.get('content', ''),
                        lesson_type=lesson_data.get('lesson_type', 'video'),
                        duration=lesson_data.get('duration', 0),
                        order=lesson_data.get('order', 1),
                        video_url=lesson_data.get('video_url', '')
                    )
                    print(f"📘 Lesson created in '{module.title}': {lesson_data.get('title')}")

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        print("❌ Course serializer errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        course = Course.objects.get(pk=pk)
        if course.instructor != request.user:
            return Response({'error': 'You do not have permission to edit this course.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = CourseSerializer(course, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        course = Course.objects.get(pk=pk)
        if course.instructor != request.user:
            return Response({'error': 'You do not have permission to delete this course.'}, status=status.HTTP_403_FORBIDDEN)
        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class CourseCreateView(generics.CreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseCreateSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)


class EnrollmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)
            
            # Check if already enrolled
            if Enrollment.objects.filter(student=request.user, course=course).exists():
                return Response(
                    {"error": "You are already enrolled in this course."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create enrollment
            enrollment = Enrollment.objects.create(
                student=request.user,
                course=course,
                status='active'
            )

            # Create initial progress record
            Progress.objects.create(
                student=request.user,
                course=course,
                percent_complete=0
            )

            return Response(
                {"message": "Successfully enrolled in course."},
                status=status.HTTP_201_CREATED
            )

        except Course.DoesNotExist:
            return Response(
                {"error": "Course not found."},
                status=status.HTTP_404_NOT_FOUND
            )
    def get(self, request, course_id):
        enrollment = Enrollment.objects.filter(student=request.user, course_id=course_id).first()  # type: ignore[attr-defined]
        if enrollment:
            serializer = EnrollmentSerializer(enrollment)
            return Response(serializer.data)
        return Response({"error": "Not enrolled."}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, course_id, student_id=None):
        course = Course.objects.get(id=course_id)
        if request.user.role == 'instructor' and course.instructor == request.user and student_id:
            enrollment = Enrollment.objects.filter(student_id=student_id, course=course).first()  # type: ignore[attr-defined]
            if enrollment:
                enrollment.delete()
                return Response({"message": "Student removed from course."}, status=status.HTTP_204_NO_CONTENT)
            return Response({"error": "Enrollment not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"error": "Only instructors can remove students from a course."}, status=status.HTTP_403_FORBIDDEN)
    

class LessonProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, lesson_id):
        try:
            lesson = Lesson.objects.get(id=lesson_id)
            course = lesson.module.course
            
            # Get or create progress record
            progress, created = Progress.objects.get_or_create(
                student=request.user,
                course=course
            )
            
            # Mark lesson as completed
            LessonProgress.objects.update_or_create(
                student=request.user,
                lesson=lesson,
                defaults={'is_completed': True}
            )
            
            # Update overall progress
            total_lessons = Lesson.objects.filter(module__course=course).count()
            completed_lessons = LessonProgress.objects.filter(
                student=request.user,
                lesson__module__course=course,
                is_completed=True
            ).count()
            
            progress.percent_complete = (completed_lessons / total_lessons) * 100
            progress.save()
            
            return Response(
                {"percent_complete": progress.percent_complete},
                status=status.HTTP_200_OK
            )
            
        except Lesson.DoesNotExist:
            return Response(
                {"error": "Lesson not found."},
                status=status.HTTP_404_NOT_FOUND
            )


class InstructorDashboardView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            if not hasattr(request.user, 'role') or request.user.role != "instructor":
                return Response({"error": "Only instructors can access this dashboard."},
                                status=status.HTTP_403_FORBIDDEN)

            courses = Course.objects.filter(instructor=request.user)  # type: ignore[attr-defined]
            course_serializer = CourseSerializer(courses, many=True, context={'request': request})


            # List enrolled students for each course
            course_students = {}
            for course in courses:
                enrollments = Enrollment.objects.filter(course=course)  # type: ignore[attr-defined]
                students = [UserSerializer(e.student).data for e in enrollments if hasattr(e.student, 'username')]
                course_students[course.id] = students

            students_count = Enrollment.objects.filter(course__in=courses).values('student').distinct().count()  # type: ignore[attr-defined]
            revenue = sum([c.price for c in courses])

            # Real earnings aggregation from Payment model
            payments = Payment.objects.filter(course__in=courses, status='completed')  # type: ignore[attr-defined]
            payments_by_month = payments.annotate(month=TruncMonth('payment_date')).values('month').annotate(amount=Sum('amount')).order_by('month')
            import calendar
            earnings = [
                {"month": calendar.month_abbr[p['month'].month], "amount": float(p['amount'])}
                for p in payments_by_month
            ]

            stats = {
                "students": students_count,
                "revenue": revenue,
                "earnings": earnings,
            }

            messages = Message.objects.filter(instructor=request.user).order_by('-created_at')[:10]  # type: ignore[attr-defined]
            message_data = [
                {
                    "id": msg.id,
                    "sender": msg.sender.username if hasattr(msg.sender, 'username') else str(msg.sender),
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
        enrollments = Enrollment.objects.filter(student=request.user)  # type: ignore[attr-defined]
        courses = [enrollment.course for enrollment in enrollments]  # type: ignore[attr-defined]
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def instructor_stats(request):
    user = request.user
    courses = Course.objects.filter(instructor=user)  # type: ignore[attr-defined]
    students = Enrollment.objects.filter(course__in=courses).values('student').distinct().count()  # type: ignore[attr-defined]
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
    messages = Message.objects.filter(instructor=user).order_by('-created_at')[:10]  # type: ignore[attr-defined]
    data = [
        {
            "id": msg.id,
            "sender": msg.sender.username if hasattr(msg.sender, 'username') else str(msg.sender),
            "content": msg.content,
            "created_at": msg.created_at,
        }
        for msg in messages
    ]
    return Response(data)

# Assignment Views
class AssignmentListCreateView(generics.ListCreateAPIView):
    queryset = Assignment.objects.all()  # type: ignore[attr-defined]
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        assignment = serializer.save()
        # Notify all students enrolled in the course
        enrollments = Enrollment.objects.filter(course=assignment.course)
        message = f"New assignment: {assignment.title} has been posted."
        for enrollment in enrollments:
            Notification.objects.create(user=enrollment.student, message=message)  # type: ignore[attr-defined]

class AssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Assignment.objects.all()  # type: ignore[attr-defined]
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

# Assignment Submission Views
class AssignmentSubmissionListCreateView(generics.ListCreateAPIView):
    queryset = AssignmentSubmission.objects.all()  # type: ignore[attr-defined]
    serializer_class = AssignmentSubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        assignment_id = self.kwargs.get('assignment_id')
        return AssignmentSubmission.objects.filter(assignment_id=assignment_id)  # type: ignore[attr-defined]

    def perform_create(self, serializer):
        assignment_id = self.kwargs.get('assignment_id')
        serializer.save(student=self.request.user, assignment_id=assignment_id)

class AssignmentSubmissionDetailView(generics.RetrieveUpdateAPIView):
    queryset = AssignmentSubmission.objects.all()  # type: ignore[attr-defined]
    serializer_class = AssignmentSubmissionSerializer
    permission_classes = [IsAuthenticated]

# Announcement Views
class AnnouncementListCreateView(generics.ListCreateAPIView):
    queryset = Announcement.objects.all()  # type: ignore[attr-defined]
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'role'):
            if user.role == 'student':
                # Student: only announcements for courses they are enrolled in
                enrolled_courses = Enrollment.objects.filter(student=user).values_list('course_id', flat=True)  # type: ignore[attr-defined]
                return Announcement.objects.filter(course_id__in=enrolled_courses)  # type: ignore[attr-defined]
            elif user.role == 'instructor':
                # Instructor: only announcements for their courses
                return Announcement.objects.filter(course__instructor=user)  # type: ignore[attr-defined]
        # Admin or fallback: all announcements
        return Announcement.objects.all()  # type: ignore[attr-defined]

    def perform_create(self, serializer):
        announcement = serializer.save(created_by=self.request.user)
        # Notify all students enrolled in the course
        enrollments = Enrollment.objects.filter(course=announcement.course)
        message = f"New announcement: {announcement.title} has been posted."
        for enrollment in enrollments:
            Notification.objects.create(user=enrollment.student, message=message)  # type: ignore[attr-defined]

class AnnouncementDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Announcement.objects.all()  # type: ignore[attr-defined]
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticated]

# Profile Views
class ProfileRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

# Module Views
class ModuleListCreateView(generics.ListCreateAPIView):
    serializer_class = ModuleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        course_id = self.request.query_params.get('course')
        if course_id:
            return Module.objects.filter(course_id=course_id)  # type: ignore[attr-defined]
        return Module.objects.all()  # type: ignore[attr-defined]

class ModuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Module.objects.all()  # type: ignore[attr-defined]
    serializer_class = ModuleSerializer
    permission_classes = [IsAuthenticated]

import logging
logger = logging.getLogger(__name__)

class LessonListCreateView(generics.ListCreateAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        print("📨 Incoming lesson data:", request.data)

        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            print("✅ Valid lesson data")
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("❌ Invalid lesson data:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class LessonDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Lesson.objects.all()  # type: ignore[attr-defined]
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

# Notification Views
class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)  # type: ignore[attr-defined]

# Gradebook Views
class GradebookListView(generics.ListAPIView):
    serializer_class = AssignmentSubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return graded submissions for the current user
        return AssignmentSubmission.objects.filter(
            student=self.request.user,
            grade__isnull=False
        ).select_related('assignment', 'assignment__course')  # type: ignore[attr-defined]


# Discussion Views
class DiscussionThreadListCreateView(generics.ListCreateAPIView):
    serializer_class = DiscussionThreadSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        return DiscussionThread.objects.filter(course_id=course_id)  # type: ignore[attr-defined]

    def perform_create(self, serializer):
        course_id = self.kwargs.get('course_id')
        serializer.save(created_by=self.request.user, course_id=course_id)

class DiscussionPostListCreateView(generics.ListCreateAPIView):
    serializer_class = DiscussionPostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        thread_id = self.kwargs.get('thread_id')
        return DiscussionPost.objects.filter(thread_id=thread_id)  # type: ignore[attr-defined]

    def perform_create(self, serializer):
        thread_id = self.kwargs.get('thread_id')
        serializer.save(author=self.request.user, thread_id=thread_id)

# Progress Views
class ProgressListView(generics.ListAPIView):
    serializer_class = ProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Progress.objects.filter(student=self.request.user)  # type: ignore[attr-defined]

# Certificate Views
class CertificateListView(generics.ListAPIView):
    serializer_class = CertificateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Certificate.objects.filter(student=self.request.user)  # type: ignore[attr-defined]

# Notification Create View
class NotificationCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Only instructors can post notifications
        if not hasattr(request.user, 'role') or request.user.role != 'instructor':
            return Response({'error': 'Only instructors can post notifications.'}, status=status.HTTP_403_FORBIDDEN)
        course_id = request.data.get('course_id')
        message = request.data.get('message')
        if not course_id or not message:
            return Response({'error': 'course_id and message are required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            course = Course.objects.get(id=course_id, instructor=request.user)  # type: ignore[attr-defined]
        except Course.DoesNotExist:  # type: ignore[attr-defined]
            return Response({'error': 'Course not found or not owned by instructor.'}, status=status.HTTP_404_NOT_FOUND)
        enrollments = Enrollment.objects.filter(course=course)
        notifications = []
        for enrollment in enrollments:
            notification = Notification.objects.create(user=enrollment.student, message=message)  # type: ignore[attr-defined]
            notifications.append(notification)
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class LessonAssignmentsView(generics.ListAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        lesson_id = self.kwargs.get('lesson_id')
        return Assignment.objects.filter(lesson_id=lesson_id)  # type: ignore[attr-defined]

class ProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        lesson_id = request.data.get('lesson_id')
        course_id = request.data.get('course_id')
        if not lesson_id or not course_id:
            return Response({'error': 'lesson_id and course_id are required.'}, status=status.HTTP_400_BAD_REQUEST)
        progress, created = Progress.objects.get_or_create(student=request.user, course_id=course_id)  # type: ignore[attr-defined]
        # For simplicity, let's assume each lesson is worth equal progress
        from .models import Lesson
        total_lessons = Lesson.objects.filter(module__course_id=course_id).count()  # type: ignore[attr-defined]
        if not total_lessons:
            return Response({'error': 'No lessons found for this course.'}, status=status.HTTP_400_BAD_REQUEST)
        # Track completed lessons in a set stored in progress (could be a JSONField in production)
        if not hasattr(progress, 'completed_lessons'):
            progress.completed_lessons = set()
        if isinstance(progress.completed_lessons, str):
            import json
            progress.completed_lessons = set(json.loads(progress.completed_lessons))
        progress.completed_lessons.add(str(lesson_id))
        percent = (len(progress.completed_lessons) / total_lessons) * 100
        progress.percent_complete = percent
        import json
        progress.completed_lessons = json.dumps(list(progress.completed_lessons))
        progress.save()
        return Response({'percent_complete': percent})

class CourseStudentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        course = Course.objects.get(id=course_id)  # type: ignore[attr-defined]
        if not hasattr(request.user, 'role') or request.user.role != 'instructor' or course.instructor != request.user:
            return Response({'error': 'Only the course instructor can view students.'}, status=403)
        enrollments = Enrollment.objects.filter(course=course)  # type: ignore[attr-defined]
        students = [enrollment.student for enrollment in enrollments]
        serializer = UserSerializer(students, many=True)
        return Response(serializer.data)

# Category Views
class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()  # type: ignore[attr-defined]
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()  # type: ignore[attr-defined]
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

# Course Progress View
class CourseProgressView(generics.RetrieveAPIView):
    serializer_class = ProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        course_id = self.kwargs['course_id']
        try:
            return Progress.objects.get(student=self.request.user, course_id=course_id)  # type: ignore[attr-defined]
        except Progress.DoesNotExist:  # type: ignore[attr-defined]
            # Create a new progress record if it doesn't exist
            course = Course.objects.get(id=course_id)  # type: ignore[attr-defined]
            # Calculate total lessons through modules
            total_lessons = sum(module.lessons.count() for module in course.modules.all())
            return Progress.objects.create(
                student=self.request.user,
                course=course,
                lessons_completed=0,
                total_lessons=total_lessons,
                percent_complete=0.0
            )  # type: ignore[attr-defined]


# Course Lessons View
class CourseLessonsView(generics.ListAPIView):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Lesson.objects.filter(
            module__course_id=self.kwargs['course_id']
        ).order_by('module__order', 'order')  # type: ignore[attr-defined]

# Enrollment List View
class EnrollmentListView(generics.ListAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(student=self.request.user)  # type: ignore[attr-defined]

# Student Dashboard View
class StudentDashboardView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

# Lesson Progress View
class LessonProgressView(generics.CreateAPIView):
    serializer_class = ProgressSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(student=self.request.user, lesson_id=self.kwargs['lesson_id'])

# Quiz Views
class QuizListCreateView(generics.ListCreateAPIView):
    queryset = Quiz.objects.all()  # type: ignore[attr-defined]
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]

class QuizDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Quiz.objects.all()  # type: ignore[attr-defined]
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]

class QuizAttemptCreateView(generics.CreateAPIView):
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(student=self.request.user, quiz_id=self.kwargs['quiz_id'])

class QuizAttemptSubmitView(generics.CreateAPIView):
    serializer_class = QuizResponseSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(attempt_id=self.kwargs['attempt_id'])

# Question Views
class QuestionListCreateView(generics.ListCreateAPIView):
    queryset = Question.objects.all()  # type: ignore[attr-defined]
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

class QuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Question.objects.all()  # type: ignore[attr-defined]
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

# Wishlist Views
class WishlistListView(generics.ListCreateAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(student=self.request.user)  # type: ignore[attr-defined]

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

class WishlistDetailView(generics.DestroyAPIView):
    queryset = Wishlist.objects.all()  # type: ignore[attr-defined]
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return Wishlist.objects.get(student=self.request.user, course_id=self.kwargs['course_id'])  # type: ignore[attr-defined]

# Learning Path Views
class LearningPathListCreateView(generics.ListCreateAPIView):
    queryset = LearningPath.objects.all()  # type: ignore[attr-defined]
    serializer_class = LearningPathSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'instructor':
            return LearningPath.objects.filter(created_by=self.request.user)  # type: ignore[attr-defined]
        return LearningPath.objects.filter(is_public=True)  # type: ignore[attr-defined]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class LearningPathDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LearningPath.objects.all()  # type: ignore[attr-defined]
    serializer_class = LearningPathSerializer
    permission_classes = [IsAuthenticated]

# Course Rating Views
class CourseRatingListCreateView(generics.ListCreateAPIView):
    serializer_class = CourseRatingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CourseRating.objects.filter(course_id=self.kwargs['course_id'])  # type: ignore[attr-defined]

    def perform_create(self, serializer):
        serializer.save(student=self.request.user, course_id=self.kwargs['course_id'])

class CourseRatingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CourseRating.objects.all()  # type: ignore[attr-defined]
    serializer_class = CourseRatingSerializer
    permission_classes = [IsAuthenticated]

# Badge Views
class BadgeListView(generics.ListAPIView):
    queryset = Badge.objects.all()  # type: ignore[attr-defined]
    serializer_class = BadgeSerializer
    permission_classes = [IsAuthenticated]

class UserBadgeListView(generics.ListAPIView):
    serializer_class = UserBadgeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserBadge.objects.filter(user=self.request.user)  # type: ignore[attr-defined]

# Payment Views
class PaymentListCreateView(generics.ListCreateAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(student=self.request.user)  # type: ignore[attr-defined]

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

class PaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Payment.objects.all()  # type: ignore[attr-defined]
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]


class AIQuizGenerateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)  # type: ignore[attr-defined]
            
            # Simulate AI-generated quiz questions
            # In a real implementation, you would integrate with Gemini AI API
            sample_questions = [
                {
                    "question": f"What is the main topic of the course '{course.title}'?",
                    "options": [
                        course.title,
                        "Programming",
                        "Design",
                        "Business"
                    ],
                    "correct_answer": 0
                },
                {
                    "question": f"Which of the following best describes the difficulty level of '{course.title}'?",
                    "options": [
                        "Beginner",
                        "Intermediate", 
                        "Advanced",
                        "Expert"
                    ],
                    "correct_answer": 0 if course.difficulty == 'beginner' else 1
                },
                {
                    "question": "What should you do to get the most out of this course?",
                    "options": [
                        "Complete all assignments",
                        "Watch videos passively",
                        "Skip difficult sections",
                        "Only read the descriptions"
                    ],
                    "correct_answer": 0
                }
            ]
            
            return Response({
                "questions": sample_questions
            })
        except Course.DoesNotExist:  # type: ignore[attr-defined]
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)


class AIQuizSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        try:
            answers = request.data.get('answers', {})
            questions = request.data.get('questions', [])
            
            # Calculate score
            correct_answers = 0
            total_questions = len(questions)
            
            for question_index, question in enumerate(questions):
                if str(question_index) in answers:
                    user_answer = answers[str(question_index)]
                    if user_answer == question.get('correct_answer', -1):
                        correct_answers += 1
            
            score = round((correct_answers / total_questions) * 100) if total_questions > 0 else 0
            
            # Save quiz result to database (optional)
            # QuizResult.objects.create(
            #     student=request.user,
            #     course_id=course_id,
            #     score=score,
            #     answers=answers
            # )
            
            return Response({
                "score": score,
                "correct_answers": correct_answers,
                "total_questions": total_questions,
                "feedback": "Great job!" if score >= 80 else "Keep studying to improve your score."
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GeminiQuizGenerateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        heading = request.data.get('heading')
        content = request.data.get('content', '')
        if not heading:
            return Response({'error': 'Course heading is required.'}, status=status.HTTP_400_BAD_REQUEST)
        prompt = f"Generate 5 multiple-choice quiz questions for a course titled '{heading}'."
        if content:
            prompt += f" Use the following content as context:\n{content}"
        # The following Gemini API usage may need to be updated to match the latest SDK:
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)  # type: ignore[attr-defined]
            model = genai.GenerativeModel('gemini-pro')  # type: ignore[attr-defined]
            response = model.generate_content(prompt)  # type: ignore[attr-defined]
            return Response({'questions': response.text})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(
            models.Q(sender=user) | models.Q(instructor=user)
        ).order_by('-created_at')  # type: ignore[attr-defined]

    def perform_create(self, serializer):
        # Expect 'instructor' in POST data for recipient
        instructor_id = self.request.data.get('instructor')
        instructor = User.objects.get(id=instructor_id)  # type: ignore[attr-defined]
        serializer.save(sender=self.request.user, instructor=instructor)

class MessageThreadView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        other_user_id = self.kwargs['user_id']
        other_user = User.objects.get(id=other_user_id)  # type: ignore[attr-defined]
        return Message.objects.filter(
            (models.Q(sender=user) & models.Q(instructor=other_user)) |
            (models.Q(sender=other_user) & models.Q(instructor=user))
        ).order_by('created_at')  # type: ignore[attr-defined]

    def perform_create(self, serializer):
        other_user_id = self.kwargs['user_id']
        other_user = User.objects.get(id=other_user_id)  # type: ignore[attr-defined]
        # If current user is instructor, sender=instructor, instructor=other_user (student)
        # If current user is student, sender=student, instructor=other_user (instructor)
        if self.request.user.role == 'instructor':
            serializer.save(sender=self.request.user, instructor=other_user)
        else:
            serializer.save(sender=self.request.user, instructor=other_user)
