from django.shortcuts import render

def landing_home(request):
    return render(request, 'index.html')