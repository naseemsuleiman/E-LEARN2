from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('instructor', 'Instructor'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, null=True, blank=True)

class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="courses"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['instructor']),
            models.Index(fields=['title']),
        ]


def __str__(self):
        return f"{self.title} (by {self.instructor.username})"

class Enrollment(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="enrollments"
    )
    course = models.ForeignKey(
        Course, 
        on_delete=models.CASCADE, 
        related_name="enrollments"
    )
    progress = models.FloatField(default=0.0)
    enrolled_at = models.DateTimeField(auto_now_add=True)

def __str__(self):
        return f"{self.student.username} in {self.course.title} - {self.progress}%"
