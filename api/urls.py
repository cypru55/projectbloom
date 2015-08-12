'''
    File name: urls.py
    Author: Liu Tuo
    Date created: 2015-08-03
    Date last modified: 2015-08-12
    Python Version: 2.7.6
'''

# define the urls for apis and the view function mapped to each url

from django.conf.urls import url, include
from . import views
from api.views import SaleViewSet
from rest_framework import routers, viewsets

router = routers.DefaultRouter()
router.register(r'sales', SaleViewSet)

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^', include(router.urls)),
    url(r'^pivot-table/sale', views.sales_pivot_table, name='sales_pivot'),

]