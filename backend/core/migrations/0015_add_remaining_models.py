# Generated manually to add remaining models

from django.db import migrations, models
import django.db.models.deletion
from django.core.validators import MinValueValidator, MaxValueValidator


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0014_handle_existing_data'),
    ]

    operations = [
        # Update Enrollment model
        migrations.AddField(
            model_name='enrollment',
            name='completed_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='enrollment',
            name='status',
            field=models.CharField(choices=[('active', 'Active'), ('completed', 'Completed'), ('cancelled', 'Cancelled')], default='active', max_length=20),
        ),
        migrations.AddField(
            model_name='enrollment',
            name='last_accessed',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name='enrollment',
            name='certificate_earned',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterUniqueTogether(
            name='enrollment',
            unique_together={('student', 'course')},
        ),
        
        # Update Module model
        migrations.AddField(
            model_name='module',
            name='duration',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='module',
            name='is_free',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterUniqueTogether(
            name='module',
            unique_together={('course', 'order')},
        ),
        
        # Update Lesson model
        migrations.AddField(
            model_name='lesson',
            name='video_duration',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='lesson',
            name='file_attachment',
            field=models.FileField(blank=True, null=True, upload_to='lesson_files/'),
        ),
        migrations.AddField(
            model_name='lesson',
            name='lesson_type',
            field=models.CharField(choices=[('video', 'Video'), ('text', 'Text'), ('quiz', 'Quiz'), ('assignment', 'Assignment'), ('file', 'File')], default='video', max_length=20),
        ),
        migrations.AddField(
            model_name='lesson',
            name='is_free',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='lesson',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AddField(
            model_name='lesson',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AlterUniqueTogether(
            name='lesson',
            unique_together={('module', 'order')},
        ),
        
        # Create LessonProgress model
        migrations.CreateModel(
            name='LessonProgress',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_completed', models.BooleanField(default=False)),
                ('watched_duration', models.IntegerField(default=0)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('last_accessed', models.DateTimeField(auto_now=True)),
                ('lesson', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='progress', to='core.lesson')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='lesson_progress', to='core.customuser')),
            ],
            options={
                'unique_together': {('student', 'lesson')},
            },
        ),
        
        # Create Quiz model
        migrations.CreateModel(
            name='Quiz',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('time_limit', models.IntegerField(default=0)),
                ('passing_score', models.IntegerField(default=70, validators=[MinValueValidator(0), MaxValueValidator(100)])),
                ('attempts_allowed', models.IntegerField(default=3)),
                ('is_randomized', models.BooleanField(default=False)),
                ('lesson', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='quiz', to='core.lesson')),
            ],
        ),
        
        # Create Question model
        migrations.CreateModel(
            name='Question',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('question_text', models.TextField()),
                ('question_type', models.CharField(choices=[('multiple_choice', 'Multiple Choice'), ('true_false', 'True/False'), ('short_answer', 'Short Answer'), ('essay', 'Essay')], default='multiple_choice', max_length=20)),
                ('points', models.IntegerField(default=1)),
                ('order', models.PositiveIntegerField(default=0)),
                ('quiz', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='questions', to='core.quiz')),
            ],
            options={
                'ordering': ['order'],
            },
        ),
        
        # Create QuestionOption model
        migrations.CreateModel(
            name='QuestionOption',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('option_text', models.CharField(max_length=255)),
                ('is_correct', models.BooleanField(default=False)),
                ('order', models.PositiveIntegerField(default=0)),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='options', to='core.question')),
            ],
            options={
                'ordering': ['order'],
            },
        ),
        
        # Create QuizAttempt model
        migrations.CreateModel(
            name='QuizAttempt',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('score', models.FloatField(blank=True, null=True)),
                ('passed', models.BooleanField(blank=True, null=True)),
                ('started_at', models.DateTimeField(auto_now_add=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('time_taken', models.IntegerField(default=0)),
                ('quiz', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attempts', to='core.quiz')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='quiz_attempts', to='core.customuser')),
            ],
        ),
        
        # Create QuizResponse model
        migrations.CreateModel(
            name='QuizResponse',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text_answer', models.TextField(blank=True)),
                ('is_correct', models.BooleanField(blank=True, null=True)),
                ('points_earned', models.FloatField(default=0)),
                ('attempt', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='responses', to='core.quizattempt')),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.question')),
                ('selected_options', models.ManyToManyField(blank=True, to='core.questionoption')),
            ],
        ),
        
        # Update Assignment model
        migrations.AddField(
            model_name='assignment',
            name='max_points',
            field=models.IntegerField(default=100),
        ),
        migrations.AddField(
            model_name='assignment',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        
        # Update AssignmentSubmission model
        migrations.AddField(
            model_name='assignmentsubmission',
            name='graded_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='graded_submissions', to='core.customuser'),
        ),
        migrations.AddField(
            model_name='assignmentsubmission',
            name='graded_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        
        # Update Announcement model
        migrations.AddField(
            model_name='announcement',
            name='is_pinned',
            field=models.BooleanField(default=False),
        ),
        
        # Update Message model
        migrations.AddField(
            model_name='message',
            name='is_read',
            field=models.BooleanField(default=False),
        ),
        
        # Update Notification model
        migrations.AddField(
            model_name='notification',
            name='title',
            field=models.CharField(max_length=255),
        ),
        migrations.AddField(
            model_name='notification',
            name='message',
            field=models.TextField(),
        ),
        migrations.AddField(
            model_name='notification',
            name='notification_type',
            field=models.CharField(choices=[('enrollment', 'Enrollment'), ('assignment', 'Assignment'), ('announcement', 'Announcement'), ('grade', 'Grade'), ('message', 'Message'), ('system', 'System')], default='system', max_length=20),
        ),
        migrations.AddField(
            model_name='notification',
            name='related_url',
            field=models.CharField(blank=True, max_length=255),
        ),
        
        # Create Badge model
        migrations.CreateModel(
            name='Badge',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField()),
                ('icon', models.CharField(max_length=50)),
                ('color', models.CharField(default='#6366f1', max_length=7)),
                ('criteria', models.JSONField(default=dict)),
            ],
        ),
        
        # Create UserBadge model
        migrations.CreateModel(
            name='UserBadge',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('earned_at', models.DateTimeField(auto_now_add=True)),
                ('badge', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.badge')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='badges', to='core.customuser')),
            ],
            options={
                'unique_together': {('user', 'badge')},
            },
        ),
        
        # Create Payment model
        migrations.CreateModel(
            name='Payment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('payment_method', models.CharField(choices=[('stripe', 'Stripe'), ('paypal', 'PayPal'), ('m_pesa', 'M-Pesa')], max_length=20)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('completed', 'Completed'), ('failed', 'Failed'), ('refunded', 'Refunded')], default='pending', max_length=20)),
                ('transaction_id', models.CharField(blank=True, max_length=255)),
                ('payment_date', models.DateTimeField(auto_now_add=True)),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='payments', to='core.course')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='payments', to='core.customuser')),
            ],
        ),
        
        # Update DiscussionThread model
        migrations.AddField(
            model_name='discussionthread',
            name='content',
            field=models.TextField(),
        ),
        migrations.AddField(
            model_name='discussionthread',
            name='is_pinned',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='discussionthread',
            name='is_locked',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='discussionthread',
            name='views',
            field=models.IntegerField(default=0),
        ),
        
        # Update DiscussionPost model
        migrations.AddField(
            model_name='discussionpost',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name='discussionpost',
            name='is_solution',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='discussionpost',
            name='likes',
            field=models.ManyToManyField(blank=True, related_name='liked_posts', to='core.customuser'),
        ),
        
        # Update Progress model
        migrations.AddField(
            model_name='progress',
            name='lessons_completed',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='progress',
            name='total_lessons',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='progress',
            name='time_spent',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterUniqueTogether(
            name='progress',
            unique_together={('student', 'course')},
        ),
        
        # Update Certificate model
        migrations.AddField(
            model_name='certificate',
            name='is_valid',
            field=models.BooleanField(default=True),
        ),
        
        # Create CourseRating model
        migrations.CreateModel(
            name='CourseRating',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rating', models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])),
                ('review', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ratings', to='core.course')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ratings', to='core.customuser')),
            ],
            options={
                'unique_together': {('student', 'course')},
            },
        ),
        
        # Create Wishlist model
        migrations.CreateModel(
            name='Wishlist',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('added_at', models.DateTimeField(auto_now_add=True)),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='wishlisted_by', to='core.course')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='wishlist', to='core.customuser')),
            ],
            options={
                'unique_together': {('student', 'course')},
            },
        ),
        
        # Create LearningPath model
        migrations.CreateModel(
            name='LearningPath',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('is_public', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('courses', models.ManyToManyField(related_name='learning_paths', to='core.course')),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.customuser')),
            ],
        ),
    ] 