from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('transactions/', views.transactions, name='transactions'),
    path('budget/', views.transactions, name='budget'),
    path('goals/', views.transactions, name='goals'),
    path('reports/', views.transactions, name='reports'),
    path('settings/', views.transactions, name='settings'),
]
