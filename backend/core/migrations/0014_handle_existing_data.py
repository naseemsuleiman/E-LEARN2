# Generated manually to handle existing data

from django.db import migrations, models
import django.db.models.deletion
from django.utils.text import slugify
import uuid


def generate_slugs_for_existing_courses(apps, schema_editor):
    Course = apps.get_model('core', 'Course')
    for course in Course.objects.all():
        if not course.slug:
            base_slug = slugify(course.title)
            slug = base_slug
            counter = 1
            while Course.objects.filter(slug=slug).exclude(pk=course.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            course.slug = slug
            course.save()


def generate_certificate_ids(apps, schema_editor):
    Certificate = apps.get_model('core', 'Certificate')
    for certificate in Certificate.objects.all():
        if not certificate.certificate_id:
            certificate.certificate_id = str(uuid.uuid4())
            certificate.save()


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0013_enrollment_payment_status'),
    ]

    operations = [
        # First, add the slug field as nullable
        migrations.AddField(
            model_name='course',
            name='slug',
            field=models.SlugField(blank=True, null=True, max_length=255),
        ),
        
        # Generate slugs for existing courses
        migrations.RunPython(generate_slugs_for_existing_courses),
        
        # Make slug unique and not nullable
        migrations.AlterField(
            model_name='course',
            name='slug',
            field=models.SlugField(unique=True, max_length=255),
        ),
        
        # Add certificate_id field as nullable
        migrations.AddField(
            model_name='certificate',
            name='certificate_id',
            field=models.CharField(max_length=50, blank=True, null=True, unique=True),
        ),
        
        # Generate certificate IDs for existing certificates
        migrations.RunPython(generate_certificate_ids),
        
        # Make certificate_id not nullable
        migrations.AlterField(
            model_name='certificate',
            name='certificate_id',
            field=models.CharField(max_length=50, unique=True),
        ),
        
        # Add other new fields
        migrations.AddField(
            model_name='customuser',
            name='points',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='customuser',
            name='level',
            field=models.IntegerField(default=1),
        ),
        migrations.AddField(
            model_name='customuser',
            name='bio',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='customuser',
            name='avatar',
            field=models.ImageField(blank=True, null=True, upload_to='avatars/'),
        ),
        migrations.AddField(
            model_name='customuser',
            name='date_of_birth',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='customuser',
            name='phone',
            field=models.CharField(blank=True, max_length=15),
        ),
        migrations.AddField(
            model_name='customuser',
            name='address',
            field=models.TextField(blank=True),
        ),
        
        # Create Category model
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('icon', models.CharField(blank=True, max_length=50)),
                ('color', models.CharField(default='#6366f1', max_length=7)),
            ],
            options={
                'verbose_name_plural': 'Categories',
            },
        ),
        
        # Add category field to Course
        migrations.AddField(
            model_name='course',
            name='category',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='core.category'),
        ),
        
        # Add other course fields
        migrations.AddField(
            model_name='course',
            name='short_description',
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AddField(
            model_name='course',
            name='original_price',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
        migrations.AddField(
            model_name='course',
            name='video_intro',
            field=models.URLField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='course',
            name='difficulty',
            field=models.CharField(choices=[('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced')], default='beginner', max_length=20),
        ),
        migrations.AddField(
            model_name='course',
            name='status',
            field=models.CharField(choices=[('draft', 'Draft'), ('published', 'Published'), ('archived', 'Archived')], default='draft', max_length=20),
        ),
        migrations.AddField(
            model_name='course',
            name='language',
            field=models.CharField(default='English', max_length=50),
        ),
        migrations.AddField(
            model_name='course',
            name='duration',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='course',
            name='total_lessons',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='course',
            name='rating',
            field=models.FloatField(default=0.0),
        ),
        migrations.AddField(
            model_name='course',
            name='total_ratings',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='course',
            name='enrolled_students',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='course',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name='course',
            name='is_featured',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='course',
            name='tags',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='course',
            name='requirements',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='course',
            name='learning_outcomes',
            field=models.JSONField(blank=True, default=list),
        ),
        
        # Add indexes
        migrations.AddIndex(
            model_name='course',
            index=models.Index(fields=['category'], name='core_course_categor_8b2c1c_idx'),
        ),
        migrations.AddIndex(
            model_name='course',
            index=models.Index(fields=['status'], name='core_course_status_9b2c1c_idx'),
        ),
        migrations.AddIndex(
            model_name='course',
            index=models.Index(fields=['is_featured'], name='core_course_is_feat_9b2c1c_idx'),
        ),
    ] 