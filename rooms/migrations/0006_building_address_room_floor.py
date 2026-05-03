from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rooms', '0005_alter_room_building'),
    ]

    operations = [
        migrations.AddField(
            model_name='building',
            name='address',
            field=models.CharField(default='', max_length=255),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='room',
            name='floor',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
    ]
