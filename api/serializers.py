'''
    File name: serializers.py
    Author: Liu Tuo
    Date created: 2015-08-11
    Date last modified: 2015-08-11
    Python Version: 2.7.6
'''

from rest_framework import serializers
from api import Sale

class SaleSerializer(serializers.HyperlinkedModelSerializer):
	class Meta:
		model = Sale