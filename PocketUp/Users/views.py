from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.utils import timezone
from .forms import RegisterForm
from .utils import send_verification_email
from django.contrib.auth import get_user_model
from django.contrib.auth import login, logout, authenticate

User = get_user_model()


def register(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = False
            user.save()
            send_verification_email(user)
            request.session['verification_user_id'] = user.id
            return redirect('verify_email')
    else:
        form = RegisterForm()
    return render(request, 'users/register.html', {'form': form})


def verify_email(request):
    user_id = request.session.get('verification_user_id')
    if not user_id:
        return redirect('register')

    user = get_object_or_404(User, id=user_id)

    if request.method == 'POST':
        code = request.POST.get('code')

        if timezone.now() > user.verification_code_expires:
            messages.error(request, 'The code has expired. Send a new one.')
            return redirect('verify_email')

        if code == user.verification_code:
            user.is_active = True
            user.is_verified = True
            user.verification_code = ''
            user.save()
            del request.session['verification_user_id']
            messages.success(request, 'Your account has been activated! You can log in.')
            return redirect('login')
        else:
            messages.error(request, 'Invalid code.')

    return render(request, 'users/verify_email.html')


def resend_verification(request):
    user_id = request.session.get('verification_user_id')
    if not user_id:
        return redirect('register')

    user = get_object_or_404(User, id=user_id)
    send_verification_email(user)
    messages.success(request, 'A new code has been sent.')
    return redirect('verify_email')

def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            messages.error(request, 'Invalid email or password.')
            return render(request, 'users/login.html')

        user = authenticate(request, username=email, password=password)

        if user is None:
            messages.error(request, 'Invalid email or password.')
            return render(request, 'users/login.html')

        if not user.is_active:
            request.session['verification_user_id'] = user.id
            messages.error(request, 'Please verify your email first.')
            return redirect('verify_email')

        login(request, user)
        return redirect('dashboard')

    return render(request, 'users/login.html')


def logout_view(request):
    logout(request)
    return redirect('landing-home')






