from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required


@login_required
def dashboard(request):
    return render(request, 'dashboard.html')

@login_required
def budget(request):
    return render(request, 'budget.html')

@login_required
def goals(request):
    return render(request, 'goals.html')

@login_required
def reports(request):
    return render(request, 'reports.html')

@login_required
def settings(request):
    return render(request, 'settings.html')