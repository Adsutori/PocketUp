from datetime import date
from django.core.cache import cache
from .recurring import process_recurring_transactions


class RecurringTransactionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        today = str(date.today())
        cache_key = 'recurring_processed'

        # Odpala się max raz dziennie dzięki cache
        if cache.get(cache_key) != today:
            process_recurring_transactions()
            cache.set(cache_key, today, timeout=86400)  # 24h

        return self.get_response(request)
