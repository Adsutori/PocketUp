from django.utils.timezone import now
from .models import RecurringTransaction, Transaction


def process_recurring_transactions():
    today = now().date()

    due = RecurringTransaction.objects.filter(
        is_active=True,
        next_run__lte=today,
    ).select_related('user', 'category')

    for rec in due:
        while rec.next_run <= today:
            if rec.end_date and rec.next_run > rec.end_date:
                rec.is_active = False
                break

            Transaction.objects.create(
                user        = rec.user,
                description = rec.description,
                amount      = rec.amount,
                type        = rec.type,
                category    = rec.category,
                date        = rec.next_run,
            )

            rec.next_run = rec.compute_next_run()

            if rec.end_date and rec.next_run > rec.end_date:
                rec.is_active = False
                break

        rec.save(update_fields=['next_run', 'is_active'])
