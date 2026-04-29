# Generated manually

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rooms', '0004_building_building_name_idx_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='room',
            name='building',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                to='rooms.building',
            ),
        ),
    ]
