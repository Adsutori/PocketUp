from django.apps import AppConfig


class TransactionsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Transactions'

    def ready(self):
        import Transactions.signals

        try:
            from django.db import connection
            from django_q.models import Schedule
            from django_q.tasks import schedule

            if 'django_q_schedule' not in connection.introspection.table_names():
                return

            if not Schedule.objects.filter(name='process_recurring').exists():
                schedule(
                    'Transactions.recurring.process_recurring_transactions',
                    schedule_type='D',
                    name='process_recurring',
                )
        except Exception:
            pass
