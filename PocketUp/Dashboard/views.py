from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import Transaction
from .forms import TransactionForm

@login_required
def dashboard(request):
    return render(request, 'dashboard.html')

@login_required
def transactions(request):
    if request.method == 'POST':
        form = TransactionForm(request.user, request.POST)
        if form.is_valid():
            transaction = form.save(commit=False)
            transaction.user = request.user
            transaction.save()
            return redirect('transactions')
    else:
        form = TransactionForm(request.user)

    transactions = Transaction.objects.filter(user=request.user).order_by('-date')
    return render(request, 'transactions.html', {
        'transactions': transactions,
        'form': form,
    })


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