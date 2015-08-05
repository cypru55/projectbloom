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

# root url for api, testing purpose.
def index(request):
    return HttpResponse("Hello, world. You're at the api index.")

# sales pivot table data
def sales_pivot_table(request):
	cursor = connections['projectbloom_data'].cursor()
	cursor.execute("""select 
	    Area, StockpointName, Products,
	    sum(week1) as week1,
	    sum(week2) as week2,
	    sum(week3) as week3,
	    sum(week4) as week4
	from (
	    select 
	    Area ,StockpointName, Products,
	    case when Date between '2015-6-29' and '2015-7-5' then Sold end as week1,
	    case when Date between '2015-7-6' and '2015-7-12' then Sold end as week2,
	    case when Date between '2015-7-13' and '2015-7-19' then Sold end as week3,
	    case when Date between '2015-7-20' and '2015-7-26' then Sold end as week4
	    from projectbloom.sale as t)
	as t2
	group by Area, StockpointName, Products""")

	row = [
        dict(zip([col[0] for col in desc], row))
        for row in cursor.fetchall()
    ]
    cursor.close()
    print row	
	# print '[%s]' % ', '.join(map(str, row))
	return HttpResponse("sales api url, TODO.")