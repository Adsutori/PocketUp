from django import forms
from .models import Transaction, Category


class TransactionForm(forms.ModelForm):
    class Meta:
        model  = Transaction
        fields = ['date', 'description', 'category', 'amount', 'type']
        widgets = {
            'date':        forms.DateInput(attrs={'type': 'date'}),
            'description': forms.TextInput(attrs={'placeholder': 'e.g. Netflix'}),
            'category':    forms.Select(),
            'amount':      forms.NumberInput(attrs={'placeholder': '0.00', 'step': '0.01'}),
            'type':        forms.Select(),
        }

    def __init__(self, user, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['category'].queryset = Category.objects.filter(user=user)
        self.fields['category'].empty_label = 'Uncategorized'

        for field_name, field in self.fields.items():
            css = 'form-input'
            if self.errors.get(field_name):
                css += ' input-error'
            field.widget.attrs['class'] = css
