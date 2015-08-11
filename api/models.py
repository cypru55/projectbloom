from django.db import models

# Create your models here.
class Sale(models.Model):
    date = models.DateField()
    stockpoint_id = models.IntegerField()
    self_stockpoint_name = models.CharField(max_length = 25)
    uplifter_id = models.IntegerField()
    uplifter_name = models.CharField(max_length = 25)
    work_profile = models.CharField(max_length = 25)
    products = models.CharField(max_length = 100)
    issued = models.DecimalField(max_digits=65, decimal_places=5)
    returned = models.DecimalField(max_digits=65, decimal_places=5)
    sold = models.DecimalField(max_digits=65, decimal_places=5)
    own_sts = models.IntegerField()
    used_for_retail = models.IntegerField()
    fiscal_year = models.IntegerField()
    quarter = models.IntegerField()
    period = models.IntegerField()
    week = models.IntegerField()
    area = models.CharField(max_length = 25)
    uplifter_profit = models.DecimalField(max_digits=65, decimal_places=5)
    stockpoint_profit = models.DecimalField(max_digits=65, decimal_places=5)
    hours_per_day = models.DecimalField(max_digits=10, decimal_places=1)
    ul_days = models.DecimalField(max_digits=10, decimal_places=5)
    sp_days = models.DecimalField(max_digits=10, decimal_places=5)
    temp = models.IntegerField()
    class Meta:
       managed = False
       db_table = 'sale'

    def __str__(self):              # __unicode__ on Python 2
        return self.name
