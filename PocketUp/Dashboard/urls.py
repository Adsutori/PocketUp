from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('budget/', views.budget, name='budget'),
    path('goals/', views.goals, name='goals'),
    path('reports/', views.reports, name='reports'),
    path('settings/', views.settings, name='settings'),
]
