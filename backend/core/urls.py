from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views
from .views import SignupView, LoginView

urlpatterns = [
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
     path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    
]
