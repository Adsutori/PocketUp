from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from Transactions.models import Transaction


@login_required
def dashboard(request):
    transactions = Transaction.objects.filter(user=request.user).order_by('-date')[:6]  
    return render(request, 'dashboard.html', {
        'transactions': transactions,
    })