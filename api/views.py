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

	sale_records = Sale.objects.using("projectbloom_data").raw("""select 
	   * from sales""")

	print sale_records
	return HttpResponse("sales api url, TODO.")
