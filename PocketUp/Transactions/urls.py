from django.urls import path
from . import views

urlpatterns = [
    path('', views.transactions, name='transactions'),
    path('edit/<int:pk>/',   views.edit_transaction,   name='edit_transaction'),
    path('delete/<int:pk>/', views.delete_transaction, name='delete_transaction'),
]
