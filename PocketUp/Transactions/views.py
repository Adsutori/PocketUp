from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import Transaction, Category
from .forms import TransactionForm
import json

@login_required
def edit_transaction(request, pk):
    transaction = get_object_or_404(Transaction, pk=pk, user=request.user)
    
    if request.method == 'POST':
        data = json.loads(request.body)
        transaction.date        = data.get('date', transaction.date)
        transaction.description = data.get('description', transaction.description)
        transaction.amount      = data.get('amount', transaction.amount)
        transaction.type        = data.get('type', transaction.type)
        
        category_id = data.get('category_id')
        if category_id:
            transaction.category = get_object_or_404(Category, pk=category_id, user=request.user)
        else:
            transaction.category = None
            
        transaction.save()
        return JsonResponse({'status': 'ok'})
    
    return JsonResponse({'status': 'error'}, status=400)


@login_required
def delete_transaction(request, pk):
    transaction = get_object_or_404(Transaction, pk=pk, user=request.user)
    
    if request.method == 'DELETE':
        transaction.delete()
        return JsonResponse({'status': 'ok'})
    
    return JsonResponse({'status': 'error'}, status=400)


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