'''
    File name: serializers.py
    Author: Liu Tuo
    Date created: 2015-08-11
    Date last modified: 2015-08-28
    Python Version: 2.7.6
'''

from rest_framework import serializers
from api.models import Sale, Delivery, ProductMargin, EntrepreneurStatus

class SaleSerializer(serializers.HyperlinkedModelSerializer):
	class Meta:
		model = Sale
		fields = ('id','date', 'stockpoint_id', 'stockpoint_name', 'uplifter_id', 
			'uplifter_name', 'work_profile', 'product', 'issued', 'returned', 'sold', 
			'own_sts', 'used_for_retail', 'fiscal_year', 'quarter', 'period', 'week', 
			'area', 'uplifter_profit', 'stockpoint_profit', 'hours_per_day', 'ul_days', 
			'sp_days')

class DeliverySerializer(serializers.HyperlinkedModelSerializer):
	class Meta:
		model = Delivery
		fields = ('id', 'stockpoint_id', 'stockpoint_name', 'area', 'product', 'qty', 
			'peso', 'fiscal_year', 'period', 'week', 'date', 'gsv', 'to_distributors', 
			'servings', 'rsv', 'inner_bags_per_case')

class ProductMarginSerializer(serializers.HyperlinkedModelSerializer):
	class Meta:
		model = ProductMargin
		fields = ('product', 'uplifter_margin', 'wholesale_margin', 'sts_margin', 'retail_margin', 'type')

class EntrepreneurStatusSerializer(serializers.HyperlinkedModelSerializer):
	class Meta:
		model = EntrepreneurStatus
		fields = ('entrepreneur_id', 'name', 'type', 'month', 'status')