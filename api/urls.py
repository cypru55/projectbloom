'''
    File name: urls.py
    Author: Liu Tuo
    Date created: 2015-08-03
    Date last modified: 2015-08-28
    Python Version: 2.7.6
'''

# define the urls for apis and the view function mapped to each url

from django.conf.urls import url, include
from . import views
from api.views import SaleViewSet, DeliveryViewSet, ProductMarginViewSet, StatusViewSet
from rest_framework import routers, viewsets

router = routers.DefaultRouter()
router.register(r'sale', SaleViewSet)
router.register(r'delivery', DeliveryViewSet)

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^', include(router.urls)),
    url(r'product_margin/(?P<type>.+)/$', ProductMarginViewSet.as_view()),
    url(r'entrepreneur_status/(?P<type>.+)/$',StatusViewSet.as_view()),
    url(r'^sale/sp-products-sold', views.sp_products_sold, name='sp-products-sold'),
    url(r'^sale/ul-days-worked', views.ul_days_worked, name='ul-days-worked'),
    url(r'^sale/ul-income', views.ul_income, name='ul-income'),
    url(r'^sale/sp-income', views.sp_income, name='sp-income'),
    url( r'^overview', views.bloom_overview, name="overview")

]