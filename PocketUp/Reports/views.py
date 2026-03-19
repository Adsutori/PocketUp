from django.shortcuts import render
from django.contrib.auth.decorators import login_required


@login_required
def reports(request):
    return render(request, 'reports.html')