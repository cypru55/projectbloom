
from django.conf.urls import url

from . import views

urlpatterns = [
	url(r'^sales_pivot_table', views.sales_pivot_table, name='sales_pivot'),
    url(r'^$', views.index, name='index'),
]