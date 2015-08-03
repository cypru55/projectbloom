'''
    File name: urls.py
    Author: Liu Tuo
    Date created: 2015-08-03
    Date last modified: 2015-08-03
    Python Version: 2.7.6
'''

from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^sales_pivot_table', views.sales_pivot_table, name='sales_pivot'),

]