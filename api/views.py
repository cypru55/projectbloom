'''
    File name: views.py
    Author: Liu Tuo
    Date created: 2015-08-03
    Date last modified: 2015-08-03
    Python Version: 2.7.6
'''

from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse

# root url for api, testing purpose.
def index(request):
    return HttpResponse("Hello, world. You're at the api index.")

# sales pivot table data
def sales_pivot_table(request):
	return HttpResponse("sales api url, TODO.")