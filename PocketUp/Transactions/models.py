from django.conf import settings
from django.db import models
from datetime import date
from dateutil.relativedelta import relativedelta
from django.core.validators import MinValueValidator, MaxValueValidator



DEFAULT_CATEGORIES = [
    {"name": "Food & Dining",  "color": "#fb923c"},
    {"name": "Transport",      "color": "#38bdf8"},
    {"name": "Housing",        "color": "#a78bfa"},
    {"name": "Entertainment",  "color": "#f472b6"},
    {"name": "Health",         "color": "#4ade80"},
    {"name": "Shopping",       "color": "#facc15"},
    {"name": "Education",      "color": "#34d399"},
    {"name": "Travel",         "color": "#60a5fa"},
    {"name": "Utilities",      "color": "#94a3b8"},
    {"name": "Income",         "color": "#1db954"},
    {"name": "Savings",        "color": "#2dd4bf"},
    {"name": "Other",          "color": "#6b7280"},
]


class Category(models.Model):
    user  = models.ForeignKey(
                settings.AUTH_USER_MODEL,
                on_delete=models.CASCADE,
                related_name='categories'
            )
    name  = models.CharField(max_length=50)
    color = models.CharField(max_length=7, default='#6c757d')

    class Meta:
        unique_together = ('user', 'name')
        ordering = ['name']

    def __str__(self):
        return self.name


class Transaction(models.Model):

    class Type(models.TextChoices):
        INCOME  = 'income',  'Income'
        EXPENSE = 'expense', 'Expense'

    user        = models.ForeignKey(
                      settings.AUTH_USER_MODEL,
                      on_delete=models.CASCADE,
                      related_name='transactions'
                  )
    date        = models.DateField(default=date.today)
    created_at  = models.DateTimeField(auto_now_add=True)
    description = models.CharField(max_length=255)
    category    = models.ForeignKey(
                      Category,
                      on_delete=models.SET_NULL,
                      null=True,
                      blank=True,
                      related_name='transactions'
                  )
    amount      = models.DecimalField(max_digits=10, decimal_places=2)
    type        = models.CharField(        
                      max_length=10,
                      choices=Type.choices,
                      default=Type.EXPENSE
                  )

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.date} | {self.description} | {self.amount}"


class RecurringTransaction(models.Model):

    interval = models.PositiveIntegerField(
        default=1,
        validators=[
            MinValueValidator(1, message='Wartość musi być większa od 0.'),
            MaxValueValidator(365, message='Wartość nie może przekraczać 365.'),
        ]
    )

    FREQUENCY_CHOICES = [
        ('daily',    'Daily'),
        ('weekly',   'Weekly'),
        ('monthly',  'Monthly'),
        ('yearly',   'Yearly'),
    ]

    user        = models.ForeignKey('Users.User', on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    amount      = models.DecimalField(max_digits=10, decimal_places=2)
    type        = models.CharField(max_length=10, choices=[('income', 'Income'), ('expense', 'Expense')])
    category    = models.ForeignKey('Category', null=True, blank=True, on_delete=models.SET_NULL)

    frequency   = models.CharField(max_length=10, choices=FREQUENCY_CHOICES)
    interval    = models.PositiveIntegerField(default=1)
    start_date  = models.DateField()
    end_date    = models.DateField(null=True, blank=True)
    next_run    = models.DateField() 

    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.description} ({self.frequency} x{self.interval})"

    def compute_next_run(self):
        """Oblicza następną datę na podstawie frequency i interval."""
        delta_map = {
            'daily':   relativedelta(days=self.interval),
            'weekly':  relativedelta(weeks=self.interval),
            'monthly': relativedelta(months=self.interval),
            'yearly':  relativedelta(years=self.interval),
        }
        return self.next_run + delta_map[self.frequency]
