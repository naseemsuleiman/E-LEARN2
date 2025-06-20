# admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import CustomUser, Course, Enrollment

class CustomUserAdmin(UserAdmin):
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'email', 'role')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'role', 'password1', 'password2'),
        }),
    )
    list_display = ('username', 'email', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)
    filter_horizontal = ('groups', 'user_permissions',)

class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'instructor', 'created_at', 'enrollment_count')
    list_select_related = ('instructor',)
    list_filter = ('created_at', 'instructor__role')
    search_fields = ('title', 'description', 'instructor__username')
    raw_id_fields = ('instructor',)
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

    def enrollment_count(self, obj):
        return obj.enrollments.count()
    enrollment_count.short_description = 'Enrollments'

class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'progress', 'enrolled_at')
    list_select_related = ('student', 'course')
    list_filter = ('enrolled_at', 'course__instructor')
    search_fields = ('student__username', 'course__title')
    raw_id_fields = ('student', 'course')
    date_hierarchy = 'enrolled_at'
    ordering = ('-enrolled_at',)
    list_editable = ('progress',)

    fieldsets = (
        (None, {
            'fields': ('student', 'course')
        }),
        ('Progress', {
            'fields': ('progress',)
        }),
    )

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Course, CourseAdmin)
admin.site.register(Enrollment, EnrollmentAdmin)