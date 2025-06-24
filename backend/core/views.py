from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import generics
from django.contrib.auth import authenticate, get_user_model
from .models import Course, Enrollment, CustomUser, Message
from .serializers import (
    CourseSerializer,
    EnrollmentSerializer,
    RegisterSerializer,
    LoginSerializer
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
            print("DEBUG:", request.user, request.user.is_authenticated, getattr(request.user, 'role', None))

            if not hasattr(request.user, 'role') or request.user.role != "instructor":
                return Response({"error": "Only instructors can access this dashboard."},
                                status=status.HTTP_403_FORBIDDEN)

            courses = Course.objects.filter(instructor=request.user)
            course_serializer = CourseSerializer(courses, many=True)

            students = Enrollment.objects.filter(course__in=courses).values('student').distinct().count()
            revenue = sum([c.price for c in courses])
            earnings = [
                {"month": "Jan", "amount": 500},
                {"month": "Feb", "amount": 700},
                {"month": "Mar", "amount": 800},
            ]
            stats = {
                "students": students,
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
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print("DASHBOARD ERROR:", str(e))
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StudentCourseListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        courses = Course.objects.all()
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
