'''
    File name: urls.py
    Author: Liu Tuo
    Date created: 2015-08-03
    Date last modified: 2015-09-10
    Python Version: 2.7.6
'''

# define the urls for apis and the view function mapped to each url

from django.conf.urls import url, include
from . import views
from api.views import SaleViewSet, DeliveryViewSet, ProductViewSet, StatusViewSet, EntrepreneurViewSet
from rest_framework import routers, viewsets

router = routers.DefaultRouter()
router.register(r'sale', SaleViewSet)
router.register(r'delivery', DeliveryViewSet)
router.register(r'entrepreneur', EntrepreneurViewSet)

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^', include(router.urls)),
    url(r'product/(?P<type>.+)/$', ProductViewSet.as_view()),
    url(r'entrepreneur_status/(?P<type>.+)/$',StatusViewSet.as_view()),
    url(r'^sale/sp-products-sold', views.sp_products_sold, name='sp-products-sold'),
    url(r'^sale/ul-days-worked', views.ul_days_worked, name='ul-days-worked'),
    url(r'^sale/ul-income', views.ul_income, name='ul-income'),
    url(r'^sale/sp-income', views.sp_income, name='sp-income'),
    url(r'fo-area', views.fo_area, name='fo-area'),
    url(r'entrepreneur/tenure',views.entrepreneur_tenure, name="entrepreneur_tenure"),
    url(r'^overview', views.bloom_overview, name="overview"),
    url(r'^update-status', views.update_status_table, name="update_status"),
    url(r'^target', views.target, name="target"),
    url(r'^uplifter-by-area', views.uplifter_by_area, name="uplifter_by_area"),
    url(r'^estimated-man-hour', views.estimated_man_hour, name="estimated_man_hour"),
    url(r'^estimated-income-per-hour', views.estimated_income_per_hour, name="estimated_income_per_hour"),
    url(r'^rsv-sold', views.rsv_sold, name="rsv_sold"),
    url(r'^case-sold', views.case_sold, name="case_sold")
]