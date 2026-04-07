from django import forms
from .models import Transaction, Category, RecurringTransaction


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

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user')
        super().__init__(*args, **kwargs)

        self.fields['category'].queryset = Category.objects.filter(user=self.user)
        self.fields['category'].empty_label = None
        self.fields['category'].required = True

        # Set "Other" as default on new transactions
        if not kwargs.get('instance'):
            try:
                other = Category.objects.get(user=self.user, name='Other')
                self.fields['category'].initial = other.pk
            except Category.DoesNotExist:
                pass

        for field_name, field in self.fields.items():
            css = 'form-input'
            if self.errors.get(field_name):
                css += ' input-error'
            field.widget.attrs['class'] = css


class RecurringTransactionForm(forms.ModelForm):
    class Meta:
        model  = RecurringTransaction
        fields = ['description', 'amount', 'type', 'category',
                  'frequency', 'interval', 'start_date', 'end_date']
        widgets = {
            'start_date': forms.DateInput(attrs={'type': 'date'}),
            'end_date':   forms.DateInput(attrs={'type': 'date'}),
            'interval':   forms.NumberInput(attrs={'min': 1, 'max': 365}),
        }

    def clean_interval(self):
        interval = self.cleaned_data.get('interval')
        if interval is None or interval < 1:
            raise forms.ValidationError('Wartość musi być większa od 0.')
        if interval > 365:
            raise forms.ValidationError('Wartość nie może przekraczać 365.')
        return interval

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user')
        super().__init__(*args, **kwargs)
        self.fields['category'].queryset = Category.objects.filter(user=self.user)
        self.fields['category'].empty_label = None
        self.fields['end_date'].required = False

        for field_name, field in self.fields.items():
            field.widget.attrs['class'] = 'form-input'

    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.user     = self.user
        instance.next_run = instance.start_date  # pierwsze wykonanie = start_date
        if commit:
            instance.save()
        return instance