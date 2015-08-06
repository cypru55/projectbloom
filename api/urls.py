'''
    File name: urls.py
    Author: Liu Tuo
    Date created: 2015-08-03
    Date last modified: 2015-08-06
    Python Version: 2.7.6
'''

# define the urls for apis and the view function mapped to each url

from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^pivot-table/sale', views.sales_pivot_table, name='sales_pivot'),

]