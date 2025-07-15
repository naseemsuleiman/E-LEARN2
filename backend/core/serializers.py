from rest_framework import serializers
from .models import (
    Course, Enrollment, CustomUser, Assignment, AssignmentSubmission, Announcement, 
    Message, Module, Lesson, Notification, DiscussionThread, DiscussionPost, 
    Progress, Certificate, Category, Quiz, Question, QuestionOption, QuizAttempt, 
    QuizResponse, LessonProgress, Badge, UserBadge, Payment, CourseRating, 
    Wishlist, LearningPath, LessonNote
)

from django.contrib.auth import authenticate
import json
from .models import Module, LessonProgress


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class CustomUserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'role', 'points', 'level',
            'bio', 'avatar', 'date_of_birth', 'phone', 'address'
        ]
        read_only_fields = ['id', 'points', 'level']

    def get_avatar(self, obj):
        request = self.context.get('request')
        if obj.avatar:
            if request is not None:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None  # or return a default placeholder image URL


class CourseSerializer(serializers.ModelSerializer):
    instructor = CustomUserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    thumbnail = serializers.ImageField(required=False)
    video_intro = serializers.SerializerMethodField()
    enrolled_students_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'short_description', 'thumbnail', 
            'instructor', 'category', 'difficulty', 'status', 'language', 'duration', 
            'total_lessons', 'rating', 'total_ratings', 'enrolled_students', 
            'enrolled_students_count', 'average_rating', 'price', 'original_price',
            'created_at', 'updated_at', 'is_featured', 'tags', 'requirements', 
            'learning_outcomes', 'video_intro'
        ]
        read_only_fields = ['id', 'instructor', 'created_at', 'updated_at', 'enrolled_students_count', 'average_rating']
    
    def get_thumbnail(self, obj):
            if obj.thumbnail:
                request = self.context.get('request')
                if request is not None:
                    return request.build_absolute_uri(obj.thumbnail.url)
                return obj.thumbnail.url
            return None  # or return a default image URL


    def get_video_intro(self, obj):
        request = self.context.get('request')
        if obj.video_intro:
            if obj.video_intro.startswith('http'):
                return obj.video_intro
            if request is not None:
                return request.build_absolute_uri(obj.video_intro)
            return obj.video_intro
        return None

    def get_enrolled_students_count(self, obj):
        return obj.enrollments.count()
    
    def get_average_rating(self, obj):
        if obj.total_ratings > 0:
            return round(obj.rating, 1)
        return 0.0

class CourseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'short_description',
            'thumbnail', 'category', 'difficulty', 'status', 'language',
            'price', 'original_price', 'tags', 'requirements',
            'learning_outcomes', 'video_intro'
        ]

    def create(self, validated_data):
        # Remove modules if they were accidentally included
        validated_data.pop('modules', None)
        return Course.objects.create(
            instructor=self.context['request'].user,
            **validated_data
        )
    def to_internal_value(self, data):
        # Parse JSON fields sent as strings in FormData
        for field in ['tags', 'requirements', 'learning_outcomes']:
            if field in data and isinstance(data[field], str):
                try:
                    data[field] = json.loads(data[field])
                except json.JSONDecodeError:
                    self.fail(f"Invalid JSON in {field}")
        return super().to_internal_value(data)



class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    student = CustomUserSerializer(read_only=True)
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = '__all__'
        read_only_fields = ['id', 'enrolled_at', 'completed_at', 'last_accessed']

    def get_progress(self, obj):
        lessons = Lesson.objects.filter(module__course=obj.course)
        total_lessons = lessons.count()
        completed_lessons = LessonProgress.objects.filter(
            student=obj.student,
            lesson__in=lessons,
            is_completed=True
        ).count()
        return int((completed_lessons / total_lessons) * 100) if total_lessons else 0



class LessonSerializer(serializers.ModelSerializer):
    module = serializers.PrimaryKeyRelatedField(queryset=Module.objects.all())
    video_url_display = serializers.SerializerMethodField(read_only=True)
    file_attachment = serializers.FileField(required=False, allow_null=True, write_only=True)

    class Meta:
        model = Lesson
        fields = '__all__'
        

    def get_video_url_display(self, obj):
        request = self.context.get('request')
        if obj.video_url and not obj.video_url.startswith("http"):
            if request:
                return request.build_absolute_uri(obj.video_url)
        return obj.video_url

    def create(self, validated_data):
        print("📥 Lesson data being saved:", validated_data)  # <== ADD THIS
        return super().create(validated_data)


class ModuleSerializer(serializers.ModelSerializer):
    lessons_count = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = '__all__'
        read_only_fields = ['id', 'lessons_count']

    def get_lessons_count(self, obj):
        return obj.lessons.count()

class LessonProgressSerializer(serializers.ModelSerializer):
    lesson = LessonSerializer(read_only=True)
    
    class Meta:
        model = LessonProgress
        fields = '__all__'
        read_only_fields = ['id', 'completed_at', 'last_accessed']


class QuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionOption
        fields = '__all__'


class QuestionSerializer(serializers.ModelSerializer):
    options = QuestionOptionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = '__all__'
        read_only_fields = ['id']


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    questions_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = '__all__'
        read_only_fields = ['id', 'questions_count']
    
    def get_questions_count(self, obj):
        return obj.questions.count()


class QuizAttemptSerializer(serializers.ModelSerializer):
    quiz = QuizSerializer(read_only=True)
    
    class Meta:
        model = QuizAttempt
        fields = '__all__'
        read_only_fields = ['id', 'started_at', 'completed_at']


class QuizResponseSerializer(serializers.ModelSerializer):
    question = QuestionSerializer(read_only=True)
    selected_options = QuestionOptionSerializer(many=True, read_only=True)
    
    class Meta:
        model = QuizResponse
        fields = '__all__'


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    assignment = serializers.PrimaryKeyRelatedField(read_only=True)
    student = CustomUserSerializer(read_only=True)
    graded_by = CustomUserSerializer(read_only=True)
    
    class Meta:
        model = AssignmentSubmission
        fields = '__all__'
        read_only_fields = ['id', 'submitted_at', 'graded_at']


class AssignmentSerializer(serializers.ModelSerializer):
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), required=False)
    lesson = serializers.PrimaryKeyRelatedField(queryset=Lesson.objects.all(), required=False)
    due_date = serializers.DateTimeField()
    submissions_count = serializers.SerializerMethodField(read_only=True)
    submissions = AssignmentSubmissionSerializer(many=True, read_only=True)

    class Meta:
        model = Assignment
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'submissions_count', 'submissions']

    def get_submissions_count(self, obj):
        return obj.submissions.count()

    # ✅ Optional: override file URL to make it absolute
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        request = self.context.get('request')
        if instance.file and hasattr(instance.file, 'url'):
            rep['file'] = request.build_absolute_uri(instance.file.url)
        else:
            rep['file'] = None
        return rep

   



class AnnouncementSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    created_by = CustomUserSerializer(read_only=True)
    
    class Meta:
        model = Announcement
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'created_by']


class MessageSerializer(serializers.ModelSerializer):
    instructor = CustomUserSerializer(read_only=True)
    sender = CustomUserSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = '__all__'


class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)
    
    class Meta:
        model = UserBadge
        fields = '__all__'
        read_only_fields = ['id', 'earned_at']


class PaymentSerializer(serializers.ModelSerializer):
    student = CustomUserSerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['id', 'payment_date']


class DiscussionThreadSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    created_by = CustomUserSerializer(read_only=True)
    posts_count = serializers.SerializerMethodField()
    
    class Meta:
        model = DiscussionThread
        fields = '__all__'
        read_only_fields = ['id', 'created_by', 'created_at', 'posts_count']
    
    def get_posts_count(self, obj):
        return obj.posts.count()


class DiscussionPostSerializer(serializers.ModelSerializer):
    thread = DiscussionThreadSerializer(read_only=True)
    author = CustomUserSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    
    class Meta:
        model = DiscussionPost
        fields = '__all__'
        read_only_fields = ['id', 'author', 'created_at', 'updated_at', 'likes_count']
    
    def get_likes_count(self, obj):
        return obj.likes.count()


class ProgressSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    lessons_progress = serializers.SerializerMethodField()

    class Meta:
        model = Progress
        fields = '__all__'
        read_only_fields = ['id', 'last_accessed']

    def get_lessons_progress(self, obj):
        # Get all lessons for this course
        modules = Module.objects.filter(course=obj.course)
        all_lessons = []
        for module in modules:
            for lesson in module.lessons.all():
                all_lessons.append(lesson)
        # Get progress for each lesson for this user
        user = self.context.get('request').user if self.context.get('request') and hasattr(self.context.get('request'), 'user') else None
        progress_map = {}
        if user:
            progresses = LessonProgress.objects.filter(student=user, lesson__in=all_lessons)
            for lp in progresses:
                progress_map[lp.lesson_id] = lp
        result = []
        for lesson in all_lessons:
            lp = progress_map.get(lesson.id)
            result.append({
                'lesson_id': lesson.id,
                'lesson_title': lesson.title,
                'duration': lesson.duration,
                'watched_duration': lp.watched_duration if lp else 0,
                'is_completed': lp.is_completed if lp else False,
            })
        return result


class CertificateSerializer(serializers.ModelSerializer):
    student = CustomUserSerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    
    class Meta:
        model = Certificate
        fields = '__all__'
        read_only_fields = ['id', 'issued_at', 'file_url', 'certificate_id']


class CourseRatingSerializer(serializers.ModelSerializer):
    student = CustomUserSerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    
    class Meta:
        model = CourseRating
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class WishlistSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    
    class Meta:
        model = Wishlist
        fields = '__all__'
        read_only_fields = ['id', 'added_at']


class LearningPathSerializer(serializers.ModelSerializer):
    courses = CourseSerializer(many=True, read_only=True)
    created_by = CustomUserSerializer(read_only=True)
    
    class Meta:
        model = LearningPath
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'confirm_password', 'role', 'first_name', 'last_name']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'student'),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Invalid credentials")


# Legacy serializers for backward compatibility
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role']


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role', 'points', 'level', 'bio', 'avatar', 'date_of_birth', 'phone', 'address']
        read_only_fields = ['id']


class LessonNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonNote
        fields = ['id', 'user', 'lesson', 'notes', 'updated_at']
        read_only_fields = ['id', 'user', 'lesson', 'updated_at']


