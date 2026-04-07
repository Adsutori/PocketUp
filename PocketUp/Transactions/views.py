from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import Transaction, Category, RecurringTransaction
from .forms import TransactionForm, RecurringTransactionForm
import json
from django.db.models import Q


@login_required
def transactions(request):
    if request.method == 'POST':
        form = TransactionForm(data=request.POST, user=request.user)
        if form.is_valid():
            transaction      = form.save(commit=False)
            transaction.user = request.user
            transaction.save()
            return redirect('transactions')
    else:
        form = TransactionForm(user=request.user)

    qs = Transaction.objects.filter(user=request.user).order_by('-date', '-created_at')

    search = request.GET.get('search', '').strip()
    if search:
        qs = qs.filter(description__icontains=search)

    amount_min = request.GET.get('amount_min', '').strip()
    amount_max = request.GET.get('amount_max', '').strip()
    if amount_min:
        qs = qs.filter(amount__gte=amount_min)
    if amount_max:
        qs = qs.filter(amount__lte=amount_max)

    date_from = request.GET.get('date_from', '').strip()
    date_to   = request.GET.get('date_to', '').strip()
    if date_from:
        qs = qs.filter(date__gte=date_from)
    if date_to:
        qs = qs.filter(date__lte=date_to)

    category_id = request.GET.get('category', '').strip()
    if category_id:
        qs = qs.filter(category__pk=category_id)

    categories = Category.objects.filter(user=request.user)

    return render(request, 'transactions.html', {
        'transactions': qs,
        'form':         form,
        'categories':   categories,
        'filters': {
            'search':     search,
            'amount_min': amount_min,
            'amount_max': amount_max,
            'date_from':  date_from,
            'date_to':    date_to,
            'category':   category_id,
        }
    })



@login_required
def edit_transaction(request, pk):
    transaction = get_object_or_404(Transaction, pk=pk, user=request.user)
    
    if request.method == 'POST':
        data = json.loads(request.body)
        
        date = data.get('date', '').strip()
        if date:
            transaction.date = date
            
        description = data.get('description', '').strip()
        if description:
            transaction.description = description
            
        amount = data.get('amount', '').strip()
        if amount:
            transaction.amount = amount
            
        transaction.type = data.get('type', transaction.type)
        
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
def recurring_transactions(request):
    if request.method == 'POST':
        form_type = request.POST.get('form_type')

        if form_type == 'add':
            form = RecurringTransactionForm(data=request.POST, user=request.user)
            if form.is_valid():
                form.save()
                return redirect('recurring_transactions')

        elif form_type == 'delete':
            pk = request.POST.get('pk')
            get_object_or_404(RecurringTransaction, pk=pk, user=request.user).delete()
            return redirect('recurring_transactions')

        elif form_type == 'toggle':
            pk = request.POST.get('pk')
            rt = get_object_or_404(RecurringTransaction, pk=pk, user=request.user)
            rt.is_active = not rt.is_active
            rt.save()
            return redirect('recurring_transactions')

    else:
        form = RecurringTransactionForm(user=request.user)

    recurring = RecurringTransaction.objects.filter(user=request.user).order_by('-created_at')

    categories = Category.objects.filter(user=request.user)

    return render(request, 'recurring_transactions.html', {
        'recurring':   recurring,
        'form':        form,
        'categories':  categories,
    })


@login_required
def edit_recurring_transaction(request, pk):
    rt = get_object_or_404(RecurringTransaction, pk=pk, user=request.user)

    if request.method == 'POST':
        data = json.loads(request.body)

        rt.description = data.get('description', rt.description).strip() or rt.description
        rt.amount      = data.get('amount', rt.amount)
        rt.type        = data.get('type', rt.type)
        rt.frequency   = data.get('frequency', rt.frequency)
        rt.interval    = data.get('interval', rt.interval)
        rt.start_date  = data.get('start_date', rt.start_date)
        rt.end_date    = data.get('end_date') or None

        category_id = data.get('category_id')
        if category_id:
            rt.category = get_object_or_404(Category, pk=category_id, user=request.user)
        else:
            rt.category = None

        rt.save()
        return JsonResponse({'status': 'ok'})

    return JsonResponse({'status': 'error'}, status=400)