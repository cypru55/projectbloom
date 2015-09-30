'''
    File name: urls.py
    Author: Liu Tuo
    Date created: 2015-08-03
    Date last modified: 2015-09-30
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
    url(r'^fo-area', views.fo_area, name='fo-area'),
    url(r'^all-area', views.get_areas, name='all-area'),
    url(r'^stockpoints', views.get_sps, name="stockpoints"),
    url(r'^ops-report/weekly-fo-submission', views.weekly_fo_submission, name="weekly-fo-submission"),
    url(r'^ops-report/challenge-action', views.challenge_action, name="challenge-action"),
    url(r'^ops-report/action-plan', views.action_plan, name="action-plan"),
    url(r'^ops-report/delivery-report', views.delivery_report, name="delivery-report"),
    url(r'entrepreneur/tenure',views.entrepreneur_tenure, name="entrepreneur-tenure"),
    url(r'^overview', views.bloom_overview, name="overview"),
    url(r'^update-status', views.update_status_table, name="update_-tatus"),
    url(r'^last-full-data-month', views.get_last_month, name="last-full-data-month"),
    url(r'^target', views.target, name="target"),
    url(r'^uplifter-by-area', views.uplifter_by_area, name="uplifter-by-area"),
    url(r'^stockpoint-by-area', views.stockpoint_by_area, name="stockpoint-by-area"),
    url(r'^case-sold-by-area', views.case_sold_by_area, name="case-sold-by-area"),
    url(r'^estimated-man-hour', views.estimated_man_hour, name="estimated-man-hour"),
    url(r'^estimated-income-per-hour', views.estimated_income_per_hour, name="estimated-income-per-hour"),
    url(r'^rsv-sold', views.rsv_sold, name="rsv_sold"),
    url(r'^case-sold', views.case_sold, name="case_sold"),
    url(r'^shareout/sp-three-month-income', views.sp_three_month_income, name="sp-three-month-income"),
    url(r'^shareout/sp-three-month-purchase-value', views.sp_three_month_purchase_value, name="sp-three-month-purchase-value"),
    url(r'^shareout/ul-income-and-man-hour', views.ul_income_and_man_hour, name="ul-income-and-man-hour"),
    url(r'^shareout/most-improved-days-worked', views.most_improved_days_worked, name="most-improved-days-worked"),
    url(r'^shareout/product-sold-detail', views.product_sold_detail, name="product-sold-detail")
]