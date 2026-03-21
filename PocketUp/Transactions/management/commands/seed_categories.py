from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from Transactions.models import Category, DEFAULT_CATEGORIES

User = get_user_model()


class Command(BaseCommand):
    help = "Creates default categories for users which don't have have them."

    def handle(self, *args, **kwargs):
        users = User.objects.all()
        created_total = 0

        for user in users:
            if not Category.objects.filter(user=user).exists():
                Category.objects.bulk_create([
                    Category(user=user, name=cat["name"], color=cat["color"])
                    for cat in DEFAULT_CATEGORIES
                ])
                created_total += len(DEFAULT_CATEGORIES)
                self.stdout.write(f'  ✓ {user.username} — categories created')

        self.stdout.write(self.style.SUCCESS(f'Ready! {created_total} categories created.'))
