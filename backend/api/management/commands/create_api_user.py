from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token


class Command(BaseCommand):
    help = 'Create an API user and generate token for development'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            default='apiuser',
            help='Username for the API user (default: apiuser)'
        )
        parser.add_argument(
            '--email',
            type=str,
            default='api@example.com',
            help='Email for the API user (default: api@example.com)'
        )

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        
        # Create or get user
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'is_active': True,
            }
        )
        
        if created:
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created user "{username}"')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'User "{username}" already exists')
            )
        
        # Create or get token
        token, created = Token.objects.get_or_create(user=user)
        
        if created:
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created token for user "{username}"')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'Token for user "{username}" already exists')
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'API Token: {token.key}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Use this token in Authorization header: Token {token.key}')
        )
