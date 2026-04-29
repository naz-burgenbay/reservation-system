import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reservations', '0003_reservation_reservation_overlap_idx_and_more'),
        ('rooms', '0005_alter_room_building'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name='reservation',
            name='room',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                to='rooms.room',
            ),
        ),
        migrations.AlterField(
            model_name='reservation',
            name='user',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AlterField(
            model_name='reservation',
            name='status',
            field=models.CharField(
                choices=[('active', 'Active'), ('canceled', 'Canceled')],
                default='active',
                max_length=10,
            ),
        ),
    ]
