from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import authenticate
from .models import Course, Enrollment, CustomUser
from .serializers import (
    CourseSerializer, 
    EnrollmentSerializer, 
    RegisterSerializer, 
    LoginSerializer
)
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
            user = serializer.validated_data  # ✅ user is already returned from serializer

            refresh = RefreshToken.for_user(user)

            # Determine role - check if superuser first
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
    def get(self, request):
        courses = Course.objects.all()
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.groups.filter(name="Instructor").exists():
            serializer = CourseSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(instructor=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": "Only instructors can create courses."}, status=status.HTTP_403_FORBIDDEN)


class EnrollmentView(APIView):
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
            if request.user.role == "instructor":  # ✅ correct way to check instructor
                courses = Course.objects.filter(instructor=request.user)
                serializer = CourseSerializer(courses, many=True)
                return Response(serializer.data)
            return Response({"error": "Only instructors can access this dashboard."}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
