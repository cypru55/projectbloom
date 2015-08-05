'''
    File name: views.py
    Author: Liu Tuo
    Date created: 2015-08-03
    Date last modified: 2015-08-05
    Python Version: 2.7.6
'''

# public apis for querying formated and analysed data from database
# used by web interface
# querying data from database, and format it into json and send the response

from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from django.db import connections
from api.models import Sale

# root url for api, testing purpose.
def index(request):
    return HttpResponse("Hello, world. You're at the api index.")

# sales pivot table data
def sales_pivot_table(request):

	sale_records = Sale.objects.using("projectbloom").raw("""select 
	    area, stockpoint_name, products,
	    sum(week1) as week1,
	    sum(week2) as week2,
	    sum(week3) as week3,
	    sum(week4) as week4
	from (
	    select 
	    area ,stockpoint_name, products,
	    case when date between '2015-6-29' and '2015-7-5' then sold end as week1,
	    case when date between '2015-7-6' and '2015-7-12' then sold end as week2,
	    case when date between '2015-7-13' and '2015-7-19' then sold end as week3,
	    case when date between '2015-7-20' and '2015-7-26' then sold end as week4
	    from sale as t)
	as t2
	group by area, stockpoint_name, products""")

	print sale_records
	return HttpResponse("sales api url, TODO.")
