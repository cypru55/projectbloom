'''
    File name: urls.py
    Author: Liu Tuo
    Date created: 2015-08-12
    Date last modified: 2015-08-12
    Python Version: 2.7.6
'''

from django.conf.urls import url, include
from . import views

urlpatterns = [
    url(r'^$', views.dashboard, name='dashboard'),

]