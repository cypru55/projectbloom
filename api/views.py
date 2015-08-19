'''
    File name: views.py
    Author: Liu Tuo
    Date created: 2015-08-03
    Date last modified: 2015-08-12
    Python Version: 2.7.6
'''

# public apis for querying formated and analysed data from database
# used by web interface
# querying data from database, and format it into json and send the response

from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.db import connections
from decimal import Decimal
from rest_framework import viewsets, generics
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from api.serializers import SaleSerializer, DeliverySerializer, ProductMarginSerializer
from api.models import Sale, Delivery, ProductMargin
import json
import datetime
import calendar

# root url for api, testing purpose.
@login_required(login_url='/login/')
def index(request):
    return HttpResponse("Hello, world. You're at the api index.")


# Rest Framework API for models, to be used to display original table
class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.using('projectbloom_data').all()
    serializer_class = SaleSerializer
    paginate_by = 10
    paginate_by_param = 'page_size'
    # Set MAX results per page
    max_paginate_by = 100
    http_method_names = ['get', 'post']

class DeliveryViewSet(viewsets.ModelViewSet):
    queryset = Delivery.objects.using('projectbloom_data').all()
    serializer_class = DeliverySerializer
    paginate_by = 10
    paginate_by_param = 'page_size'
    # Set MAX results per page
    max_paginate_by = 100
    http_method_names = ['get', 'post']

class ProductMarginViewSet(generics.ListAPIView):
    serializer_class = ProductMarginSerializer
    paginate_by = 10
    paginate_by_param = 'page_size'
    # Set MAX results per page
    max_paginate_by = 100
    http_method_names = ['get']
    def get_queryset(self):
        product_margin_type = self.kwargs['type']
        queryset = ProductMargin.objects.using('projectbloom_data').all()
        if product_margin_type == 'latest':
            queryset = queryset.filter(type='latest')
        elif product_margin_type == 'old':
            queryset = queryset.filter(type='old')
        elif product_margin_type == 'lp4y':
            queryset = queryset.filter(type='lp4y')
        return queryset

# stockpoint product sold pivot table
@login_required(login_url='/login/')
def sp_products_sold(request):
    if request.method == 'GET':
        # parse the date in the http get parameter
        periods = parse_date_to_period(request)
        
        # generate query using periods
        (query, column_name) = generate_sp_product_sold_table_query(periods)

        # execute the query
        cursor = connections['projectbloom_data'].cursor()
        cursor.execute(query)
        desc = cursor.description
        row = [
                dict(zip([col[0] for col in desc], row))

                for row in cursor.fetchall()
                ]
        cursor.close()

        # clean up rows with all null
        row = clean_null_colunm(column_name,row)

        json_str = json.dumps(row, default=defaultencode)

        return HttpResponse(json_str, content_type="application/json")

# uplifter days worked
@login_required(login_url='/login/')
def ul_days_worked(request):
    if request.method == 'GET':
        # parse the date in the http get parameter
        periods = parse_date_to_period(request)
        
        # generate query using periods
        (query, column_name) = generate_ul_worked_days_query(periods)

        # execute the query
        cursor = connections['projectbloom_data'].cursor()
        cursor.execute(query)
        desc = cursor.description
        row = [
                dict(zip([col[0] for col in desc], row))

                for row in cursor.fetchall()
                ]
        cursor.close()

        # clean up rows with all null
        row = clean_null_colunm(column_name,row)

        json_str = json.dumps(row, default=defaultencode)

        return HttpResponse(json_str, content_type="application/json")

# uplifter weekly or monthly income
@login_required(login_url='/login/')
def ul_income(request):
    if request.method == 'GET':
        # parse the date in the http get parameter
        periods = parse_date_to_period(request)
        
        # generate query using periods
        (query, column_name) = generate_sp_product_sold_table_query(periods)

        # execute the query
        cursor = connections['projectbloom_data'].cursor()
        cursor.execute(query)
        desc = cursor.description
        row = [
                dict(zip([col[0] for col in desc], row))

                for row in cursor.fetchall()
                ]
        cursor.close()

        # clean up rows with all null
        row = clean_null_colunm(column_name,row)

        json_str = json.dumps(row, default=defaultencode)

        return HttpResponse(json_str, content_type="application/json")
    
# stock point monthly income
@login_required(login_url='/login/')
def sp_income(request):
    if request.method == 'GET':
        # parse the date in the http get parameter
        periods = parse_date_to_period(request)
        
        # generate query using periods
        (query, column_name) = generate_sp_income_query(periods)

        # execute the query
        cursor = connections['projectbloom_data'].cursor()
        cursor.execute(query)
        desc = cursor.description
        row = [
                dict(zip([col[0] for col in desc], row))

                for row in cursor.fetchall()
                ]
        cursor.close()

        # clean up rows with all null
        row = clean_null_colunm(column_name,row)

        json_str = json.dumps(row, default=defaultencode)

        return HttpResponse(json_str, content_type="application/json")

# parse the date into period
def parse_date_to_period(request):
    # read the start date and end date
    # start date must be monday
    # no parameter, then use today as end date and display previous 4 weeks
    if 'option' in request.GET and request.GET['option'] == "monthly":
        option = "monthly"
    else:
        option = "weekly"
        
    date_format = "%Y-%m-%d"
    if 'sd' in request.GET and 'ed' in request.GET:
        start_date = datetime.datetime.strptime(request.GET['sd'], date_format)
        end_date = datetime.datetime.strptime(request.GET['ed'], date_format)
        periods = period_generator(start_date, end_date, date_format, option)
    elif 'sd' not in request.GET and 'ed' in request.GET:
        end_date = datetime.datetime.strptime(request.GET['ed'], date_format)
        start_date = end_date - datetime.timedelta(weeks=4) + datetime.timedelta(days=1)
        periods = period_generator(start_date, end_date, date_format, option)
    else:
        today = datetime.datetime.now()
        days_left_for_this_week = 6 - datetime.datetime.today().weekday()
        end_date = today + datetime.timedelta(days=days_left_for_this_week)
        start_date = end_date - datetime.timedelta(weeks=4) + datetime.timedelta(days=1)
        periods = period_generator(start_date, end_date, date_format, option)
    return periods

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

# hepler function to check if all value is null, if not change null to 0
def is_all_null(json_object, column_name):
    for col in column_name:
        if json_object[col] is not None:
            return False
    return True

# remove rows with all null in given column, change null to 0
def clean_null_colunm(column_name, pivot_table_json):
    new_array = []
    for i in xrange(len(pivot_table_json)):
        if not is_all_null(pivot_table_json[i], column_name):
            for key in pivot_table_json[i]:
                if pivot_table_json[i][key] is None:
                    pivot_table_json[i][key] = 0
            new_array.append(pivot_table_json[i])
    return new_array

# helper function for getting first day and last day of the month
def get_month_day_range(date):
    """
    For a date 'date' returns the start and end date for the month of 'date'.

    Month with 31 days:
    >>> date = datetime.date(2011, 7, 27)
    >>> get_month_day_range(date)
    (datetime.date(2011, 7, 1), datetime.date(2011, 7, 31))

    Month with 28 days:
    >>> date = datetime.date(2011, 2, 15)
    >>> get_month_day_range(date)
    (datetime.date(2011, 2, 1), datetime.date(2011, 2, 28))
    """
    first_day = date.replace(day = 1)
    last_day = date.replace(day = calendar.monthrange(date.year, date.month)[1])
    return first_day, last_day

# helper function for getting the week period from given start date and end date
def period_generator(start_date, end_date, date_format, option):
    periods = []
    one_day = datetime.timedelta(days=1)
    
    if option == "weekly":
        current_start_date = start_date   
        time_delta = datetime.timedelta(weeks=1)
        while current_start_date < end_date:
            period = {}
            period['start_date'] = current_start_date.strftime(date_format)
            if current_start_date + time_delta - one_day <= end_date:
                period['end_date'] = (current_start_date + time_delta - one_day).strftime(date_format)
            else:
                period['end_date'] = end_date.strftime(date_format)
            periods.append(period)
            current_start_date = current_start_date + time_delta
    elif option == "monthly":
         current_month_range = get_month_day_range(start_date)
         end_date_month_range = get_month_day_range(end_date)
         while current_month_range[1] <= end_date_month_range[1]:
             period = {}
             period['start_date'] = current_month_range[0].strftime(date_format)
             period['end_date'] = current_month_range[1].strftime(date_format)
             periods.append(period)
             current_month_range = get_month_day_range(current_month_range[1] + one_day)
    return periods

# helper function for generating query for stockpoint product sold table
def generate_sp_product_sold_table_query(periods):
    query_part_1 = ""
    query_part_2 = ""
    col_name = []
    # use start date as the column name
    for period in periods:
        col_name.append(period['start_date'])
        query_part_1 += "sum(`%s`) as `%s`,\n" % (period['start_date'], period['start_date'])
        query_part_2 += "case when date between '%s' and '%s' then sold end as `%s`,\n" % (period['start_date'],period['end_date'], period['start_date'])
    # remove the last colon
    query_part_1 = query_part_1[:-2]
    query_part_1 += "\n"
    query_part_2 = query_part_2[:-2]
    query_part_2 += "\n"

    # build complete query
    query = """select
    area, stockpoint_name, product,\n"""
    query += query_part_1
    query += """from (
    select
    area ,stockpoint_name, product,\n"""
    query += query_part_2
    query += """from projectbloom.sale as t)
    as t2
    group by area, stockpoint_name, product\n"""

    return (query, col_name)

# helper function for generating query for uplifter worked days
def generate_ul_worked_days_query(periods):
    query_part_1 = ""
    query_part_2 = ""
    col_name = []
    # use start date as the column name
    for period in periods:
        col_name.append(period['start_date'])
        query_part_1 += "sum(`%s`) as `%s`,\n" % (period['start_date'], period['start_date'])
        query_part_2 += "case when date between '%s' and '%s' then ul_days end as `%s`,\n" % (period['start_date'],period['end_date'], period['start_date'])
    # remove the last colon
    query_part_1 = query_part_1[:-2]
    query_part_1 += "\n"
    query_part_2 = query_part_2[:-2]
    query_part_2 += "\n"

    # build complete query
    query = """select
    area, stockpoint_name, uplifter_name,\n"""
    query += query_part_1
    query += """from (
    select
    area ,stockpoint_name, uplifter_name,\n"""
    query += query_part_2
    query += """from projectbloom.sale as t)
    as t2
    group by area, stockpoint_name, uplifter_name\n"""

    return (query, col_name)

# helper function for generating uplifter income over period query, can be weekly or monthly    
def generate_ul_weekly_income_query(periods):
    query_part_1 = ""
    query_part_2 = ""
    col_name = []
    # use start date as the column name
    for period in periods:
        col_name.append(period['start_date'])
        query_part_1 += "sum(`%s`) as `%s`,\n" % (period['start_date'], period['start_date'])
        query_part_2 += "case when date between '%s' and '%s' then uplifter_profit end as `%s`,\n" % (period['start_date'],period['end_date'], period['start_date'])
    # remove the last colon
    query_part_1 = query_part_1[:-2]
    query_part_1 += "\n"
    query_part_2 = query_part_2[:-2]
    query_part_2 += "\n"

    # build complete query
    query = """select
    area, stockpoint_name, uplifter_name,\n"""
    query += query_part_1
    query += """from (
    select
    area ,stockpoint_name, uplifter_name,\n"""
    query += query_part_2
    query += """from projectbloom.sale as t)
    as t2
    group by area, stockpoint_name, uplifter_name\n"""

    return (query, col_name)

    
# hlper function for generating stockpoint monthly income query
def generate_sp_income_query(periods):
    query_part_1 = ""
    query_part_2 = ""
    col_name = []
    # use start date as the column name
    for period in periods:
        col_name.append(period['start_date'])
        query_part_1 += "sum(`%s`) as `%s`,\n" % (period['start_date'], period['start_date'])
        query_part_2 += "case when date between '%s' and '%s' then stockpoint_profit end as `%s`,\n" % (period['start_date'],period['end_date'], period['start_date'])
    # remove the last colon
    query_part_1 = query_part_1[:-2]
    query_part_1 += "\n"
    query_part_2 = query_part_2[:-2]
    query_part_2 += "\n"

    # build complete query
    query = """select
    area, stockpoint_name,\n"""
    query += query_part_1
    query += """from (
    select
    area ,stockpoint_name,\n"""
    query += query_part_2
    query += """from projectbloom.sale as t)
    as t2
    group by area, stockpoint_name\n"""
    
    return (query, col_name)

class JSONResponse(HttpResponse):
    """
    An HttpResponse that renders its content into JSON.
    """
    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)

