from django.utils.timezone import now
from .models import RecurringTransaction, Transaction


def process_recurring_transactions():
    """
    Wywołaj tę funkcję raz dziennie.
    Tworzy Transaction dla każdego RecurringTransaction którego next_run <= dziś.
    """
    today = now().date()

    due = RecurringTransaction.objects.filter(
        is_active=True,
        next_run__lte=today,
    ).select_related('user', 'category')

    for rec in due:
        # Pomiń jeśli seria już wygasła
        if rec.end_date and rec.next_run > rec.end_date:
            rec.is_active = False
            rec.save(update_fields=['is_active'])
            continue

        # Utwórz rzeczywistą transakcję
        Transaction.objects.create(
            user=rec.user,
            description=rec.description,
            amount=rec.amount,
            type=rec.type,
            category=rec.category,
            date=rec.next_run,
        )

        # Przesuń next_run do przodu
        rec.next_run = rec.compute_next_run()

        # Dezaktywuj jeśli następny run przekracza end_date
        if rec.end_date and rec.next_run > rec.end_date:
            rec.is_active = False

        rec.save(update_fields=['next_run', 'is_active'])