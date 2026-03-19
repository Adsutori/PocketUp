from django import forms
from .models import Transaction, Category


class TransactionForm(forms.ModelForm):
    class Meta:
        model  = Transaction
        fields = ['date', 'description', 'category', 'amount', 'type']
        widgets = {
            'date':        forms.DateInput(attrs={'type': 'date', 'class': 'form-input'}),
            'description': forms.TextInput(attrs={'placeholder': 'e.g. Netflix', 'class': 'form-input'}),
            'category':    forms.Select(attrs={'class': 'form-input'}),
            'amount':      forms.NumberInput(attrs={'placeholder': '0.00', 'step': '0.01', 'class': 'form-input'}),
            'type':        forms.Select(attrs={'class': 'form-input'}),
        }

    def __init__(self, user, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['category'].queryset = Category.objects.filter(user=user)
        self.fields['category'].empty_label = 'Uncategorized'
