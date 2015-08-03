from django.shortcuts import render
from django.http import HttpResponse

# root url for api, testing purpose.
def index(request):
    return HttpResponse("Hello, world. You're at the api index.")

# sales pivot table data
def sales_pivot_table(request):
	return HttpResponse("sales api url, TODO.")