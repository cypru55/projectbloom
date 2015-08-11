'''
    File name: views.py
    Author: Liu Tuo
    Date created: 2015-08-03
    Date last modified: 2015-08-11
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
import json
import datetime

# root url for api, testing purpose.
@login_required(login_url='/login/')
def index(request):
    return HttpResponse("Hello, world. You're at the api index.")

# retriving sale table
@login_required(login_url='/login/')
def sale_list(request):
    return HttpResponse("sale api")


# sales pivot table data
@login_required(login_url='/login/')
def sales_pivot_table(request):
    if request.method == 'GET':
        # read the start date and end date
        # start date must be monday
        # no parameter, then use today as end date and display previous 4 weeks

        date_format = "%Y-%m-%d"
        if 'sd' in request.GET and 'ed' in request.GET:
            start_date = datetime.datetime.strptime(request.GET['sd'], date_format)
            end_date = datetime.datetime.strptime(request.GET['ed'], date_format)
            periods = period_generator(start_date, end_date, date_format)
        elif 'sd' not in request.GET and 'ed' in request.GET:
            end_date = datetime.datetime.strptime(request.GET['ed'], date_format)
            start_date = end_date - datetime.timedelta(weeks=4) + datetime.timedelta(days=1)
            periods = period_generator(start_date, end_date, date_format)
        else:
            today = datetime.datetime.now()
            days_left_for_this_week = 6 - datetime.datetime.today().weekday()
            end_date = today + datetime.timedelta(days=days_left_for_this_week)
            start_date = end_date - datetime.timedelta(weeks=4) + datetime.timedelta(days=1)
            periods = period_generator(start_date, end_date, date_format)

        # generate query using periods
        (query, column_name) = generate_sale_pivot_table_query(periods)

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

# helper function for getting the week period from given start date and end date
def period_generator(start_date, end_date, date_format):
    periods = []
    current_start_date = start_date
    one_week = datetime.timedelta(weeks=1)
    one_day = datetime.timedelta(days=1)

    while current_start_date < end_date:
        period = {}
        period['start_date'] = current_start_date.strftime(date_format)
        if current_start_date + one_week - one_day <= end_date:
            period['end_date'] = (current_start_date + one_week - one_day).strftime(date_format)
        else:
            period['end_date'] = end_date.strftime(date_format)
            
        periods.append(period)
        current_start_date = current_start_date + one_week
    return periods

# helper function for generating query for sales pivot table
def generate_sale_pivot_table_query(periods):
    query_part_1 = ""
    query_part_2 = ""
    col_name = []
    # use start date as the column name
    for period in periods:
        col_name.append(period['start_date'])
        query_part_1 += "sum(`%s`) as `%s`,\n" % (period['start_date'], period['start_date'])
        query_part_2 += "case when Date between '%s' and '%s' then Sold end as `%s`,\n" % (period['start_date'],period['end_date'], period['start_date'])
    # remove the last colon
    query_part_1 = query_part_1[:-2]
    query_part_1 += "\n"
    query_part_2 = query_part_2[:-2]
    query_part_2 += "\n"

    # build complete query
    query = """select
    Area, StockpointName, Products,\n"""
    query += query_part_1
    query += """from (
    select
    Area ,StockpointName, Products,\n"""
    query += query_part_2
    query += """from projectbloom.sale as t)
    as t2
    group by Area, StockpointName, Products\n"""

    return (query, col_name)

class JSONResponse(HttpResponse):
    """
    An HttpResponse that renders its content into JSON.
    """
    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)
