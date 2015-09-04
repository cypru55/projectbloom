'''
    File name: models.py
    Author: Liu Tuo
    Date created: 2015-08-11
    Date last modified: 2015-09-04
    Python Version: 2.7.6
'''
from django.db import models

# Create your models here.
class Entrepreneur(models.Model):
    id = models.AutoField(primary_key=True)
    area = models.CharField(max_length = 25)
    name = models.CharField(max_length = 50)
    role = models.CharField(max_length = 10)
    work_profile = models.CharField(max_length = 20)
    vest = models.IntegerField()
    visor = models.IntegerField()
    name_card = models.IntegerField()
    detailer = models.IntegerField()
    backpack = models.IntegerField()
    cooler_box = models.IntegerField()
    metal_trolley = models.IntegerField()
    clip_board = models.IntegerField()
    others = models.CharField(max_length = 100)
    tools_requested = models.CharField(max_length = 100)
    remarks_on_tools = models.CharField(max_length = 100)
    contact = models.CharField(max_length = 50)
    address = models.CharField(max_length = 200)
    organization = models.CharField(max_length = 20)

    class Meta:
        managed = False
        db_table = 'entrepreneur'
    def __str__(self):              # __unicode__ on Python 2
        return self.name

class Sale(models.Model):
    id = models.AutoField(primary_key=True)
    date = models.DateField()
    area = models.CharField(max_length = 25)
    stockpoint_id = models.IntegerField()
    stockpoint_name = models.CharField(max_length = 50)
    uplifter_id = models.IntegerField()
    uplifter_name = models.CharField(max_length = 50)
    hours_per_day = models.DecimalField(max_digits=2, decimal_places=1)
    sold = models.DecimalField(max_digits=65, decimal_places=5)
    own_sts = models.IntegerField()
    used_for_retail = models.DecimalField(max_digits=65, decimal_places=2)
    uplifter_profit = models.DecimalField(max_digits=65, decimal_places=5)
    stockpoint_profit = models.DecimalField(max_digits=65, decimal_places=5)
    product = models.CharField(max_length = 100)

    class Meta:
       managed = False
       db_table = 'sale_db'

    def __str__(self):              # __unicode__ on Python 2
        return self.name

class Delivery(models.Model):
    id = models.AutoField(primary_key=True)
    date = models.DateField()
    area = models.CharField(max_length = 25)
    stockpoint_id = models.IntegerField()
    stockpoint_name = models.CharField(max_length = 50)
    product = models.CharField(max_length = 100)
    qty = models.IntegerField()
    peso = models.DecimalField(max_digits=65, decimal_places=2)
    gsv = models.IntegerField()
    to_distributors = models.DecimalField(max_digits=65, decimal_places=5)
    servings = models.IntegerField()
    rsv = models.IntegerField()
    inner_bags = models.IntegerField()

    class Meta:
       managed = False
       db_table = 'delivery'

    def __str__(self):              # __unicode__ on Python 2
        return self.name

class DeliveryPricing(models.Model):
    product = models.CharField(max_length = 100)
    gsv_per_case = models.IntegerField()
    delivery_per_case = models.DecimalField(max_digits=65, decimal_places=5)
    servings_per_case = models.IntegerField()
    rsv_per_case = models.IntegerField()
    inner_bags_per_case = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'delivery_pricing'
        
    def __str__(self):              # __unicode__ on Python 2
        return self.name

class Product(models.Model):
    id = models.AutoField(primary_key=True)
    product = models.CharField(max_length = 100)
    company = models.CharField(max_length = 25)
    uplifter_margin = models.DecimalField(max_digits=65, decimal_places=2)
    wholesale_margin = models.DecimalField(max_digits=65, decimal_places=2)
    sts_margin = models.DecimalField(max_digits=65, decimal_places=2)
    retail_margin = models.DecimalField(max_digits=65, decimal_places=2)
    type = models.CharField(max_length = 10)
    class Meta:
       managed = False
       db_table = 'product'

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