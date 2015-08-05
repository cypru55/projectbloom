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
from decimal import Decimal
import json

# root url for api, testing purpose.
def index(request):
    return HttpResponse("Hello, world. You're at the api index.")

# sales pivot table data
def sales_pivot_table(request):
	if request.method == 'GET':
	    # read the start date and end date
	    # start date must be monday
	    # no parameter, then use today as end date and display previous 4 weeks
	    # TODO

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
	    desc = cursor.description
	    row = [
	        dict(zip([col[0] for col in desc], row))

	        for row in cursor.fetchall()
	    ]
	    cursor.close()

	    column_name = ["week1", "week2","week3","week4"]

	    # clean up rows with all null
	    row = clean_null_colunm(column_name,row)

	    json_str = json.dumps(row, default=defaultencode)
	    
	    return HttpResponse(json_str, content_type="application/json")

# helper class for serializing float
class float_value(float):
    def __init__(self, value):
        self._value = value
    def __repr__(self):
        return str(self._value)

# encoding function for dump
def defaultencode(o):
    if isinstance(o, Decimal):
        # Subclass float with custom repr?
        return float_value(o)
    raise TypeError(repr(o) + " is not JSON serializable")

# hepler function to check if all value is null
def is_all_null(json_object, column_name):
    for col in column_name:
    	if json_object[col] is not None:
    		return False
    return True

# remove rows with all null in given column
def clean_null_colunm(column_name, pivot_table_json):
    new_array = []
    for i in xrange(len(pivot_table_json)):
    	if not is_all_null(pivot_table_json[i], column_name):
            new_array.append(pivot_table_json[i])
    return new_array