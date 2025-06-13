from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User, Group
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class SignupView(APIView):
    def post(self, request):
        print("Request data:", request.data)

        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        role = request.data.get('role')

        print(f"username={username}, email={email}, password={password}, role={role}")

        if not all([username, email, password, role]):
            return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(password)
        except Exception as e:
            print("Password validation error:", e)
            return Response({"error": list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, email=email, password=password)

        group, _ = Group.objects.get_or_create(name=role.capitalize())
        user.groups.add(group)
        user.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            "message": f"User '{username}' created as '{role}'.",
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    serializer_class = TokenObtainPairSerializer
    """
    Uses SimpleJWT's TokenObtainPairView to handle login.
    POST: username, password -> returns refresh & access tokens.
    """
    pass