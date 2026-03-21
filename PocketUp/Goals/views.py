from django.shortcuts import render
from django.contrib.auth.decorators import login_required


@login_required
def goals(request):
    return render(request, 'goals.html')