'''
    File name: models.py
    Author: Liu Tuo
    Date created: 2015-08-11
    Date last modified: 2015-08-28
    Python Version: 2.7.6
'''
from django.db import models

# Create your models here.
class Sale(models.Model):
    id = models.AutoField(primary_key=True)
    date = models.DateField()
    stockpoint_id = models.IntegerField()
    stockpoint_name = models.CharField(max_length = 50)
    uplifter_id = models.IntegerField()
    uplifter_name = models.CharField(max_length = 50)
    work_profile = models.CharField(max_length = 25)
    product = models.CharField(max_length = 100)
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
    class Meta:
       managed = False
       db_table = 'sale'

    def __str__(self):              # __unicode__ on Python 2
        return self.name

class Delivery(models.Model):
    id = models.AutoField(primary_key=True)
    stockpoint_id = models.IntegerField()
    stockpoint_name = models.CharField(max_length = 50)
    area = models.CharField(max_length = 25)
    product = models.CharField(max_length = 100)
    qty = models.IntegerField()
    peso = models.DecimalField(max_digits=65, decimal_places=2)
    fiscal_year = models.IntegerField()
    period = models.IntegerField()
    week = models.IntegerField()
    date = models.DateField()
    gsv = models.IntegerField()
    to_distributors = models.DecimalField(max_digits=65, decimal_places=5)
    servings = models.IntegerField()
    rsv = models.IntegerField()
    inner_bags_per_case = models.IntegerField()
    class Meta:
       managed = False
       db_table = 'delivery'

    def __str__(self):              # __unicode__ on Python 2
        return self.name

class ProductMargin(models.Model):
    id = models.AutoField(primary_key=True)
    product = models.CharField(max_length = 100)
    uplifter_margin = models.DecimalField(max_digits=65, decimal_places=2)
    wholesale_margin = models.DecimalField(max_digits=65, decimal_places=2)
    sts_margin = models.DecimalField(max_digits=65, decimal_places=2)
    retail_margin = models.DecimalField(max_digits=65, decimal_places=2)
    type = models.CharField(max_length = 10)
    class Meta:
       managed = False
       db_table = 'product_margin'

    def __str__(self):              # __unicode__ on Python 2
        return self.name

class EntrepreneurStatus(models.Model):
    id = models.AutoField(primary_key=True)
    entrepreneur_id = models.IntegerField()
    name = models.CharField(max_length = 50)
    type = models.CharField(max_length = 10)
    month = models.CharField(max_length = 10)
    status = models.CharField(max_length = 5)

    class Meta:
       managed = False
       db_table = 'entrepreneur_status'

    def __str__(self):              # __unicode__ on Python 2
        return self.name