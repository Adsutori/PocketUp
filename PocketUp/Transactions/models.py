from django.conf import settings
from django.db import models
from datetime import date
from django.utils import timezone


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
