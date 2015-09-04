'''
    File name: serializers.py
    Author: Liu Tuo
    Date created: 2015-08-11
    Date last modified: 2015-09-04
    Python Version: 2.7.6
'''

from rest_framework import serializers
from api.models import Sale, Delivery, Entrepreneur, Product, EntrepreneurStatus

class EntrepreneurSerializer(serializers.HyperlinkedModelSerializer):
	class Meta:
		model = Entrepreneur
		fields = ('id', 'area', 'name', 'role', 'work_profile', 'vest', 'visor', 'name_card', 
			'detailer', 'backpack', 'cooler_box', 'metal_trolley', 'clip_board', 'others', 
			'tools_requested', 'remarks_on_tools', 'contact', 'address', 'organization')

class SaleSerializer(serializers.HyperlinkedModelSerializer):
	class Meta:
		model = Sale
		fields = ('id', 'date', 'area', 'stockpoint_id', 'stockpoint_name', 'uplifter_id', 
			'uplifter_name', 'hours_per_day', 'sold', 'own_sts', 'used_for_retail', 'uplifter_profit',
			 'stockpoint_profit', 'product')

class DeliverySerializer(serializers.HyperlinkedModelSerializer):
	class Meta:
		model = Delivery
		fields = ('id', 'date', 'area', 'stockpoint_id', 'stockpoint_name', 'product', 'qty', 'peso', 
			'gsv', 'to_distributors', 'servings', 'rsv', 'inner_bags' )

class ProductSerializer(serializers.HyperlinkedModelSerializer):
	class Meta:
		model = Product
		fields = ('id', 'product', 'company', 'uplifter_margin', 'wholesale_margin', 'sts_margin',
		 'retail_margin', 'type')

class EntrepreneurStatusSerializer(serializers.HyperlinkedModelSerializer):
	class Meta:
		model = EntrepreneurStatus
		fields = ('entrepreneur_id', 'name', 'type', 'month', 'status')