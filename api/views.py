'''
    File name: views.py
    Author: Liu Tuo
    Date created: 2015-08-03
    Date last modified: 2015-09-30
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
from api.serializers import SaleSerializer, DeliverySerializer, ProductSerializer, EntrepreneurStatusSerializer, EntrepreneurSerializer
from api.models import Entrepreneur, Sale, Delivery, Product, EntrepreneurStatus
from rest_framework import filters
import json
import datetime
import calendar

# root url for api, testing purpose.


@login_required(login_url='/login/')
def index(request):
    return HttpResponse("Hello, world. You're at the api index.")

################## Rest Framework View Set for Models #######

# Rest Framework API for models, to be used to display original table
class SaleViewSet(viewsets.ModelViewSet):
    filter_backends = (filters.DjangoFilterBackend,filters.OrderingFilter,filters.SearchFilter,)
    filter_fields = ('id', "date", "area", "stockpoint_id", "stockpoint_name", "uplifter_id", "uplifter_name",)
    ordering = ('id', 'date', 'area', 'stockpoint_id', 'stockpoint_name', 'uplifter_id', 
            'uplifter_name', 'hours_per_day', 'sold', 'own_sts', 'used_for_retail', 'uplifter_profit',
             'stockpoint_profit', 'product',)
    search_fields = ('id', 'area', 'date', 'stockpoint_id' ,'stockpoint_name', "uplifter_id", 'uplifter_name')
    queryset = Sale.objects.using('projectbloom_data').all()
    serializer_class = SaleSerializer
    paginate_by = 10
    paginate_by_param = 'page_size'
    # Set MAX results per page
    http_method_names = ['get', 'post']


class DeliveryViewSet(viewsets.ModelViewSet):
    filter_backends = (filters.DjangoFilterBackend,filters.OrderingFilter,filters.SearchFilter,)
    filter_fields = ('id', "date", "area", "stockpoint_id", "stockpoint_name", "product", )
    ordering =  ('id', 'date', 'area', 'stockpoint_id', 'stockpoint_name', 'product', 'qty', 'peso', 
            'gsv', 'to_distributors', 'servings', 'rsv', 'inner_bags', )
    search_fields = ('id', "date", "area", "stockpoint_id", "stockpoint_name", "product", )
    queryset = Delivery.objects.using('projectbloom_data').all()
    serializer_class = DeliverySerializer
    paginate_by = 10
    paginate_by_param = 'page_size'
    # Set MAX results per page
    http_method_names = ['get', 'post']


class EntrepreneurViewSet(viewsets.ModelViewSet):
    filter_backends = (filters.DjangoFilterBackend,filters.OrderingFilter,filters.SearchFilter,)
    filter_fields = ('id', "area", "name", "role", )
    ordering = ('id', 'area', 'name', 'role', 'work_profile', 'vest', 'visor', 'name_card', 
            'detailer', 'backpack', 'cooler_box', 'metal_trolley', 'clip_board', 'others', 
            'tools_requested', 'remarks_on_tools', 'contact', 'address', 'organization')
    search_fields = ('id', 'area','name', 'role',)
    queryset = Entrepreneur.objects.using('projectbloom_data').all()
    serializer_class = EntrepreneurSerializer
    paginate_by = 10
    paginate_by_param = 'page_size'
    # Set MAX results per page
    http_method_names = ['get', 'post']

    
class ProductViewSet(generics.ListAPIView):
    filter_backends = (filters.DjangoFilterBackend,filters.OrderingFilter,filters.SearchFilter,)
    filter_fields = ('id', 'product', 'company', 'type',)
    ordering = ('id', 'product', 'company', 'uplifter_margin', 'wholesale_margin', 'sts_margin',
         'retail_margin', 'type',)
    search_fields = ('id', 'product', 'company', 'type',)
    serializer_class = ProductSerializer
    paginate_by = 10
    paginate_by_param = 'page_size'
    # Set MAX results per page
    http_method_names = ['get']

    def get_queryset(self):
        product_margin_type = self.kwargs['type']
        queryset = Product.objects.using('projectbloom_data').all()
        if product_margin_type == 'latest':
            queryset = queryset.filter(type='latest')
        elif product_margin_type == 'old':
            queryset = queryset.filter(type='old')
        elif product_margin_type == 'lp4y':
            queryset = queryset.filter(type='lp4y')
        return queryset


class StatusViewSet(generics.ListAPIView):
    serializer_class = EntrepreneurStatusSerializer
    paginate_by_param = 'page_size'
    http_method_names = ['get']

    def get_queryset(self):
        queryset = EntrepreneurStatus.objects.using(
            'projectbloom_data').all().filter(type=self.kwargs['type'])
        return queryset


################## Pivot Tables #################

# stockpoint product sold pivot table


@login_required(login_url='/login/')
def sp_products_sold(request):
    if request.method == 'GET':
        # parse the date in the http get parameter
        periods = parse_date_to_period(request)

        # generate query using periods
        (query, column_name) = generate_sp_product_sold_table_query(periods)

        # execute the query
        row = execute_query(query)

        # clean up rows with all null
        row = clean_null_colunm(column_name, row)

        result = {}
        result['data'] = row
        result['headers'] = column_name

        json_str = json.dumps(result, default=defaultencode)

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
        row = execute_query(query)

        # clean up rows with all null
        row = clean_null_colunm(column_name, row)

        result = {}
        result['data'] = row
        result['headers'] = column_name

        json_str = json.dumps(result, default=defaultencode)

        return HttpResponse(json_str, content_type="application/json")

# uplifter weekly or monthly income


@login_required(login_url='/login/')
def ul_income(request):
    if request.method == 'GET':
        # parse the date in the http get parameter
        periods = parse_date_to_period(request)

        # generate query using periods
        (query, column_name) = generate_ul_income_query(periods)
        

        # execute the query
        row = execute_query(query)
        
        # clean up rows with all null
        row = clean_null_colunm(column_name, row)
        

        result = {}
        result['data'] = row
        result['headers'] = column_name

        if request.GET['option'] == 'monthly':
            query2= generate_ul_status_query(periods)
            status = execute_query(query2)
            result['status'] = status

        json_str = json.dumps(result, default=defaultencode)

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
        row = execute_query(query)
        
        # clean up rows with all null
        row = clean_null_colunm(column_name, row)

        result = {}
        result['data'] = row
        result['headers'] = column_name
        
        if request.GET['option'] == 'monthly':
            query2 = generate_sp_status_query(periods)
            status = execute_query(query2)
            result['status'] = status

        json_str = json.dumps(result, default=defaultencode)

        return HttpResponse(json_str, content_type="application/json")

# get areas under each fo

##################### Utility Queries #####################

@login_required(login_url='/login/')
def fo_area(request):
    if request.method == 'GET':
        query = """
            SELECT * FROM fo_area;
        """
        result = execute_query(query)
        json_str = json.dumps(result, default=defaultencode)
        return HttpResponse(json_str, content_type="application/json")

# update status table


@login_required(login_url='/login/')
def update_status_table(request):
    if request.method == 'GET':
        now = datetime.datetime.now().strftime("%b-%y")
        cursor = connections['projectbloom_data'].cursor()
        query = """
            truncate entrepreneur_status;
            call Update_SP_StatusTable("Jun-14","%s");
            call Update_UL_StatusTable("Jun-14","%s");
        """ % (now, now)
        try:
            execute_query(query)
            result = {"status": "success"}
        except:
            result = {"status": "fail"}

        json_str = json.dumps(result, default=defaultencode)
        return HttpResponse(json_str, content_type="application/json")

# get last month with full data
@login_required(login_url='/login/')
def get_last_month(request):
    if request.method == 'GET':
        query="""
        SELECT 
            value
        FROM
            configuration
        WHERE
            name = 'last_full_data_month'
        """
        result = execute_query(query)
        json_str = json.dumps(result, default=defaultencode)
        return HttpResponse(json_str, content_type="application/json")

def get_last_fully_updated_month():    
    query="""
    SELECT 
        value
    FROM
        configuration
    WHERE
        name = 'last_full_data_month'
    """

    result = execute_query(query)

    return result[0]['value']

# get list of areas
def get_areas(request):
    if request.method == 'GET':
        query = """
        SELECT DISTINCT
            area
        FROM
            sale_db
        """
        result = execute_query(query)

        json_str = json.dumps(result, default=defaultencode)
        return HttpResponse(json_str, content_type="application/json")

# get list of stockpoints under given area
def get_sps(request):
    if request.method == 'GET':
        filter_query = ""
        if 'area' in request.GET:
            filter_query = """
            AND area = '%s'
            """ % request.GET['area']

        query = """
        SELECT 
            name, area
        FROM
            entrepreneur
        WHERE
            role = 'Stockpoint'
            %s
        """ % filter_query
        result = execute_query(query)

        json_str = json.dumps(result, default=defaultencode)
        return HttpResponse(json_str, content_type="application/json")

################## Operation ###############################


# get target count for this month


@login_required(login_url='/login/')
def target(request):
    if request.method == 'GET':
        params = {}
        now = datetime.datetime.now()
        filter_query = ""
        filter_query2 = ""
        (first_day, last_day) = get_month_day_range(now)
        lastmonth = first_day - datetime.timedelta(days=1)
        now = now.strftime('%b-%y')
        (first_day_lastmonth, last_day_lastmonth) = get_month_day_range(
            lastmonth)
        lastmonth = lastmonth.strftime('%b-%y')

        if 'area' in request.GET:
            area = request.GET['area']
            params['area'] = request.GET['area']
            filter_query = "residence_area='%s' AND " % area
            filter_query2 = "AND area = '%s'" % area
        elif 'fo' in request.GET and request.GET['fo'] != 'All':
            fo = request.GET['fo'].lower()
            params['fo'] = request.GET['fo']
            filter_query = "username='%s' AND " % fo

            areas = execute_query("""
                SELECT area From fo_area WHERE fo_name='""" + request.GET['fo'] + "'")
            filter_query2 = "AND ("
            for i in areas:
                filter_query2 += "area='" + i['area'] + "' OR "
            filter_query2 = filter_query2[:-3]
            filter_query2 += ")"

        query1 = """
            SELECT
                COUNT(*) as count
            FROM
                ul_prescreening
            WHERE
                %s
                    date_of_interview BETWEEN DATE('%s') AND DATE('%s');
        """ % (filter_query, first_day.strftime('%Y-%m-%d'), last_day.strftime('%Y-%m-%d'))

        query2 = """
            SELECT
                COUNT(*) as count
            FROM
                sp_prescreening
            WHERE
                %s
                    date_of_interview BETWEEN DATE('%s') AND DATE('%s');
        """ %  (filter_query, first_day.strftime('%Y-%m-%d'), last_day.strftime('%Y-%m-%d'))

        query3 = """
            SELECT 
                COUNT(*) as count
            FROM
                ul_prescreening
            WHERE
                %s
                    date_of_interview BETWEEN DATE('%s') AND DATE('%s');
        """ % (filter_query, first_day_lastmonth.strftime('%Y-%m-%d'), last_day_lastmonth.strftime('%Y-%m-%d'))

        query4 = """
            SELECT
                COUNT(*) as count
            FROM
                sp_prescreening
            WHERE
                %s
                    date_of_interview BETWEEN DATE('%s') AND DATE('%s');
        """ %  (filter_query, first_day_lastmonth.strftime('%Y-%m-%d'), last_day_lastmonth.strftime('%Y-%m-%d'))

        query5 = """
        SELECT
            SUM(target) as target
        FROM
            target
        WHERE
            type = 'Uplifter'
            %s
        """ % filter_query2
        query6 = """
        SELECT
            SUM(target) as target
        FROM
            target
        WHERE
            type = 'Stockpoint'
            %s
        """ % filter_query2

        result = {"ul": {}, "sp": {}}

        result['ul']['this_month'] = execute_query(
            generate_bloom_overview_query(params, 'ul_overview', now))
        result['sp']['this_month'] = execute_query(
            generate_bloom_overview_query(params, 'sp_overview', now))
        result['ul']['last_month'] = execute_query(
            generate_bloom_overview_query(params, 'ul_overview', lastmonth))
        result['sp']['last_month'] = execute_query(
            generate_bloom_overview_query(params, 'sp_overview', lastmonth))
        result['ul']['this_month_potential'] = execute_query(query1)
        result['sp']['this_month_potential'] = execute_query(query2)
        result['ul']['last_month_potential'] = execute_query(query3)
        result['sp']['last_month_potential'] = execute_query(query4)
        result['ul']['target'] = execute_query(query5)
        result['sp']['target'] = execute_query(query6)

        json_str = json.dumps(result, default=defaultencode)
        return HttpResponse(json_str, content_type="application/json")

# get weekly fo submission count
@login_required(login_url='/login/')
def weekly_fo_submission(request):
    if request.method == 'GET':
        if 'end_date' in request.GET and 'start_date' in request.GET:
            start_date = request.GET['start_date']
            end_date = request.GET['end_date']
        else:
            json_str = json.dumps({}, default=defaultencode)
            return HttpResponse(json_str, content_type="application/json")

        query1 = """
        (SELECT 
            username, 
            Date_format(DATE(date_of_visit),'%%Y-%%m-%%d') AS date, 
            'SP Vist Checklist' as form
        FROM
            stockpoint_visit
        WHERE
            DATE(date_of_visit) BETWEEN '%s' AND '%s')

        """ % (start_date, end_date)
        query2 = """
        (SELECT 
            username, 
            Date_format(DATE(date_of_interview),'%%Y-%%m-%%d') AS date, 
            'Prescreening UL' as form
        FROM
            ul_prescreening
        WHERE
            DATE(date_of_interview) BETWEEN '%s' AND '%s')
        """ % (start_date, end_date)
        query3 = """
        (SELECT 
            username,
            Date_format(DATE(date_of_interview),'%%Y-%%m-%%d') AS date,
            'Prescreening SP' AS form
        FROM
            sp_prescreening
        WHERE
            DATE(date_of_interview) BETWEEN '%s' AND '%s')
        """ % (start_date, end_date)
        query4 = """
        (SELECT 
            username,
            Date_format(DATE(date_and_time),'%%Y-%%m-%%d') AS date,
            'Quaterly Survey' AS form
        FROM
            bloom_quarterly_survey
        WHERE
            DATE(date_and_time) BETWEEN '%s' AND '%s')
        """ % (start_date, end_date)
        query5 = """
        (SELECT 
            username,
            Date_format(DATE(date_and_time),'%%Y-%%m-%%d') AS date,
            'Meeting Form' AS form
        FROM
            meeting_form
        WHERE
            DATE(date_and_time) BETWEEN '%s' AND '%s')
        """ % (start_date, end_date)
        query6 = """
        (SELECT 
            username,
            Date_format(DATE(date_and_time),'%%Y-%%m-%%d') AS date,
            'Exit Interview' AS form
        FROM
            exit_interview
        WHERE
            DATE(date_and_time) BETWEEN '%s' AND '%s')
        """ % (start_date, end_date)

        aggregate_query1 = """
        SELECT username, form, count(*) as count
        FROM
        (%s
        UNION ALL
        %s   
        UNION ALL
        %s 
        UNION ALL
        %s 
        UNION ALL
        %s 
        UNION ALL
        %s 
        ) AS t
        GROUP BY username , form
        ORDER BY form
        """ % (query1, query2, query3, query4, query5, query6)
        
        aggregate_query2 = """
        SELECT username, date, count(*) as count
        FROM
        (%s
        UNION ALL
        %s   
        UNION ALL
        %s 
        UNION ALL
        %s 
        UNION ALL
        %s 
        UNION ALL
        %s 
        ) AS t
        GROUP BY username , date
        ORDER BY STR_TO_DATE(date, '%%Y-%%m-%%d')
        """ % (query1, query2, query3, query4, query5, query6)
        result = {}
        result['by_form'] = execute_query(aggregate_query1)
        result['by_date'] = execute_query(aggregate_query2)
        json_str = json.dumps(result, default=defaultencode)
        return HttpResponse(json_str, content_type="application/json")

# get challenges with area and start_date, end_date 
@login_required(login_url='/login/')
def challenge_action(request):
    if request.method == 'GET':
        if 'end_date' in request.GET and 'start_date' in request.GET and 'area' in request.GET:
            start_date = request.GET['start_date']
            end_date = request.GET['end_date']
            area = request.GET['area']
        else:
            json_str = json.dumps({}, default=defaultencode)
            return HttpResponse(json_str, content_type="application/json")

        query = """
        SELECT 
            e.name as Name,
            e.id as `Stockpoint ID`,
            DATE_FORMAT(DATE(s.date_of_visit),'%%Y-%%m-%%d') AS Date,
            s.challenges as Challenges,
            s.action_plan as `Action Plan`
        FROM
            entrepreneur AS e,
            stockpoint_visit AS s
        WHERE
            e.area = '%s'
                AND e.id = s.entrepreneur_code
                AND DATE(s.date_of_visit) BETWEEN '%s' AND '%s'
        ORDER BY s.date_of_visit
        """ % (area, start_date, end_date)

        result = execute_query(query)
        json_str = json.dumps(result, default=defaultencode)
        return HttpResponse(json_str, content_type="application/json")

# get action plan

@login_required(login_url='/login/')
def action_plan(request):
    if request.method == 'GET':
        if 'end_date' in request.GET and 'start_date' in request.GET and 'area' in request.GET:
            start_date = request.GET['start_date']
            end_date = request.GET['end_date']
            area = request.GET['area']
        else:
            json_str = json.dumps({}, default=defaultencode)
            return HttpResponse(json_str, content_type="application/json")

        query = """
        SELECT 
            DATE_FORMAT(DATE(date_and_time), '%%Y-%%m-%%d') AS Date,
            REPLACE(bloom_area, '_', ' ') AS Area,
            venue as Venue,
            event_type as `Event Type`,
            feedback_from_participants as `Feedback`,
            action_items as `Action Plan`
        FROM
            meeting_form
        WHERE
            bloom_area = '%s'
                AND DATE(date_and_time) BETWEEN '%s' AND '%s'
        ORDER BY date_and_time
        """ % (area, start_date, end_date)

        result = execute_query(query)
        json_str = json.dumps(result, default=defaultencode)
        return HttpResponse(json_str, content_type="application/json")


# get delivery report
@login_required(login_url='/login/')
def delivery_report(request):
    if request.method == 'GET':
        if 'area' in request.GET:
            filter_query = "AND area = '%s'" % request.GET['area']
        elif 'fo' in request.GET:
            areas = execute_query("""
                SELECT area From fo_area WHERE fo_name='%s'""" % request.GET['fo'])
            filter_query = " AND ("
            for i in areas:
                filter_query += "area='%s' OR " % i['area']
            # change last logic operator to and
            filter_query = filter_query[:-3]
            filter_query += ")"
        else:
            filter_query = ''

        now = datetime.datetime.now()
        pre_month = get_pre_month(now)
        now = now.strftime("%b-%y")
        pre_month = pre_month.strftime("%b-%y")
        result = {}
        result['this_month'] = []
        result['month'] = {}
        result['month']['pre_month'] = pre_month
        result['month']['this_month'] = now

        query1 = """
        SELECT 
            area as Area,
            stockpoint_id as `Stockpoint ID`,
            stockpoint_name as `Stockpoint Name`,
            Date_FORMAT(date, '%%b-%%y') as Month,
            product as Product,
            SUM(qty) as Sum
        FROM
            delivery
        WHERE
            DATE_FORMAT(date, '%%b-%%y') = '%s'
            %s
        GROUP BY stockpoint_name
        ORDER By area, stockpoint_name, product
        """ % (pre_month, filter_query)

        result['pre_month'] = execute_query(query1)

        products = execute_query("""
            SELECT 
                product
            FROM
                projectbloom.product
            WHERE
                type = 'latest'
            """)

        for product in products:
            query = """
            SELECT 
                e.area AS Area,
                s.entrepreneur_code AS `Stockpoint ID`,
                e.name AS `Stockpoint Name`,
                DATE_FORMAT(s.date_of_visit, '%%b-%%y') AS Month,
                '%s' AS Product,
                SUM(s.`%s`) AS Sum
            FROM
                stockpoint_visit AS s,
                entrepreneur AS e
            WHERE
                s.entrepreneur_code = e.id
                and DATE_FORMAT(s.date_of_visit, '%%b-%%y')='%s'
                %s
            GROUP BY entrepreneur_code , month
            ORDER BY e.area, e.name
            """ % (product['product'], product['product'].replace (" ", "_"), now, filter_query)

            try:
                result['this_month'].extend(execute_query(query))
            except:
                # do nothing
                pass
                
        json_str = json.dumps(result, default=defaultencode)
        return HttpResponse(json_str, content_type="application/json")


################## Dashboard - monthly #####################

#### KPI ####
#
# get project bloom overview data

@login_required(login_url='/login/')
def bloom_overview(request):
    if request.method == 'GET':
        params = {}
        if 'area' in request.GET:
            params['area'] = request.GET['area']
        elif 'fo' in request.GET:
            params['fo'] = request.GET['fo']

        # execute the queries
        result = {}
        result["ul_overview"] = execute_query(
            generate_bloom_overview_query(params, 'ul_overview', None))
        result["sp_overview"] = execute_query(
            generate_bloom_overview_query(params, 'sp_overview', None))
        result["ul_without_lp4y_overview"] = execute_query(
            generate_bloom_overview_query(params, 'ul_without_lp4y_overview', None))

        json_str = json.dumps(result, default=defaultencode)
        return HttpResponse(json_str, content_type="application/json")

# get entreprenur tenure

@login_required(login_url='/login/')
def entrepreneur_tenure(request):
    if request.method == 'GET':
        filter_query = ' '
        if 'area' in request.GET:
            filter_query = "exists (select * from entrepreneur where entrepreneur_id=id and area='" + \
                request.GET['area'] + "') AND "
        elif 'fo' in request.GET:
            areas = execute_query("""
                SELECT area From fo_area WHERE fo_name='""" + request.GET['fo'] + "'")
            filter_query = " exists (select * from entrepreneur where entrepreneur_id=id and ("
            for i in areas:
                filter_query += "area='" + i['area'] + "' OR "
            # change last logic operator to and
            filter_query = filter_query[:-3]
            filter_query += ")) and"
            
        last_fully_updated_month = get_last_fully_updated_month()

        query = """
            SELECT 
            t.id as id, MAX(MONTHDIFF(date)) AS tenure
            FROM
                sale_db,
                (SELECT 
                    entrepreneur_id as id
                FROM
                    entrepreneur_status
                WHERE
                        %s
                        month = '%s'
                        AND ISINPROGRAM(entrepreneur_id,"%s") > 0) as t
            WHERE
                uplifter_id = t.id or stockpoint_id = t.id
            group by id

        """ % (filter_query, last_fully_updated_month, last_fully_updated_month)

        result = execute_query(query)

        json_str = json.dumps(result, default=defaultencode)
        return HttpResponse(json_str, content_type="application/json")

# get estmiate income per hour

@login_required(login_url='/login/')
def estimated_income_per_hour(request):
    if request.method == 'GET':
        filter_query = ' '
        if 'area' in request.GET:
            filter_query = " AND area='%s'" % request.GET['area']
        elif 'fo' in request.GET:
            areas = execute_query("""
                SELECT area From fo_area WHERE fo_name='%s'""" % request.GET['fo'])
            filter_query = " AND ("
            for i in areas:
                filter_query += "area='%s' OR " % i['area']
            # change last logic operator to and
            filter_query = filter_query[:-3]
            filter_query += ")"
        query1 = """
        SELECT 
            SUM(t.profit) / SUM(t.hours_per_day) AS profit_per_hour,
            month,
            area
        FROM
            (SELECT 
                uplifter_id,
                    SUM(uplifter_profit) AS profit,
                    hours_per_day,
                    area,
                    DATE_FORMAT(date, '%%b-%%y') AS month
            FROM
                sale_db AS s, entrepreneur_status AS es
            WHERE
                uplifter_id > 0
                AND (s.uplifter_id = es.entrepreneur_id
                AND DATE_FORMAT(s.date, '%%b-%%y') = es.month
                AND (es.type = 'LP4Y_UL' or es.type = 'TSPI_UL')
                AND (es.status = 'S' OR es.status = 'S1'
                OR es.status = 'S2'))
                %s
            GROUP BY s.date , s.uplifter_id) AS t
        WHERE
            t.uplifter_id > 0
        GROUP BY area , month
        """ % filter_query
        query2 = """
        SELECT 
            SUM(t.profit) / SUM(t.hours_per_day) AS profit_per_hour,
            month
        FROM
            (SELECT 
                uplifter_id,
                    SUM(uplifter_profit) AS profit,
                    hours_per_day,
                    area,
                    DATE_FORMAT(date, '%%b-%%y') AS month
            FROM
                sale_db AS s, entrepreneur_status AS es
            WHERE
                uplifter_id > 0
                AND (s.uplifter_id = es.entrepreneur_id
                AND DATE_FORMAT(s.date, '%%b-%%y') = es.month
                AND (es.type = 'LP4Y_UL' or es.type = 'TSPI_UL')
                AND (es.status = 'S' OR es.status = 'S1'
                OR es.status = 'S2'))
                %s
            GROUP BY s.date , s.uplifter_id) AS t
        WHERE
            t.uplifter_id > 0
        GROUP BY  month
        """ % filter_query
        result = {}
        result['by_area'] = execute_query(query1)
        result['average'] = execute_query(query2)

        json_str = json.dumps(result, default=defaultencode)
        return HttpResponse(json_str, content_type="application/json")

#### additional analysis ####

# get rsv sold (business contribution)

@login_required(login_url='/login/')
def rsv_sold(request):
    if request.method == 'GET':
        filter_query = ' '
        if 'area' in request.GET:
            filter_query = " AND area='%s'" % request.GET['area']
        elif 'fo' in request.GET:
            areas = execute_query("""
                SELECT area From fo_area WHERE fo_name='%s'""" % request.GET['fo'])
            filter_query = " AND ("
            for i in areas:
                filter_query += "area='%s' OR " % i['area']
            # change last logic operator to and
            filter_query = filter_query[:-3]
            filter_query += ")"
        query1 = """
        SELECT 
            SUM(inner_bags) AS inner_bags_sum,
            DATE_FORMAT(date, '%%b-%%y') AS month,
            p.company as company
        FROM
            delivery as d
        left join product as p on p.product=d.product and p.type="latest"
        where d.date is not null
            %s 
        GROUP BY month, company
        ORDER BY date;
        """ % filter_query
        query2 = """
        SELECT 
            SUM(rsv) AS rsv,
            DATE_FORMAT(date, '%%b-%%y') AS month,
            p.company AS company
        FROM
            delivery AS d
                LEFT JOIN
            product AS p ON p.product = d.product
                AND p.type = 'latest'
        WHERE
            d.date IS NOT NULL
            %s
        GROUP BY month , company
        ORDER BY date;
        """ % filter_query
        result = {}
        result['sku']= execute_query(query1)
        result['rsv']= execute_query(query2)

        json_str = json.dumps(result, default=defaultencode)
        return HttpResponse(json_str, content_type="application/json")


# get case sold

@login_required(login_url='/login/')
def case_sold(request):
    if request.method == 'GET':
        filter_query = ' '
        if 'area' in request.GET:
            filter_query = " AND d.area='%s'" % request.GET['area']
        elif 'fo' in request.GET:
            areas = execute_query("""
                SELECT area From fo_area WHERE fo_name='%s'""" % request.GET['fo'])
            filter_query = " AND ("
            for i in areas:
                filter_query += "d.area='%s' OR " % i['area']
            # change last logic operator to and
            filter_query = filter_query[:-3]
            filter_query += ")"

        query1 = """
        SELECT 
            SUM(qty) AS qty_sum,
            DATE_FORMAT(date, '%%b-%%y') AS month,
            p.company AS company
        FROM
            delivery AS d
                LEFT JOIN
            product AS p ON p.product = d.product
                AND p.type = 'latest'
        WHERE
            d.date IS NOT NULL
            %s
        GROUP BY month , company;
        """ % filter_query

        query2 = """
        SELECT 
            SUM(qty) AS qty_sum,
            product,
            DATE_FORMAT(date, '%%b-%%y') AS month
        FROM
            delivery as d
        WHERE
            date IS NOT NULL
            %s
        GROUP BY product , month
        ORDER BY product
        """ % filter_query
        result = {}
        result['by_product'] = execute_query(query2)
        result['by_company'] = execute_query(query1)

        json_str = json.dumps(result, default=defaultencode)
        return HttpResponse(json_str, content_type="application/json")

@login_required(login_url='/login/')
def case_sold_by_area(request):
    if request.method == 'GET':
        filter_query = ' '
        if 'area' in request.GET:
            filter_query = " WHERE area='%s'" % request.GET['area']
        elif 'fo' in request.GET:
            areas = execute_query("""
                SELECT area From fo_area WHERE fo_name='%s'""" % request.GET['fo'])
            filter_query = " WHERE ("
            for i in areas:
                filter_query += "area='%s' OR " % i['area']
            # change last logic operator to and
            filter_query = filter_query[:-3]
            filter_query += ")"

        query = """
        SELECT 
            SUM(qty) AS count,
            area,
            DATE_FORMAT(date, '%%b-%%y') AS month
        FROM
            delivery
        %s
        GROUP BY area , DATE_FORMAT(date, '%%b-%%y')
        order by date
        """ % filter_query
        result = execute_query(query)

        json_str = json.dumps(result, default=defaultencode)
        return HttpResponse(json_str, content_type="application/json")

# get uplifter count by area

@login_required(login_url='/login/')
def uplifter_by_area(request):
    if request.method == 'GET':
        filter_query = ' '
        if 'area' in request.GET:
            filter_query = " AND area='%s'" % request.GET['area']
        elif 'fo' in request.GET:
            areas = execute_query("""
                SELECT area From fo_area WHERE fo_name='%s'""" % request.GET['fo'])
            filter_query = " AND ("
            for i in areas:
                filter_query += "area='%s' OR " % i['area']
            # change last logic operator to and
            filter_query = filter_query[:-3]
            filter_query += ")"
        query = """
        SELECT count(DISTINCT
            uplifter_id) as count, area, DATE_FORMAT(date, '%%b-%%y') AS month
        FROM
            sale_db
        where uplifter_id>0
            %s
        GROUP BY area , DATE_FORMAT(date, '%%b-%%y')
        ORDER BY STR_TO_DATE(month, '%%b-%%y')
        """ % filter_query
        result = execute_query(query)

        json_str = json.dumps(result, default=defaultencode)
        return HttpResponse(json_str, content_type="application/json")

# get stockpoint count by area

@login_required(login_url='/login/')
def stockpoint_by_area(request):
    if request.method == 'GET':
        filter_query = ' '
        if 'area' in request.GET:
            filter_query = " AND area='%s'" % request.GET['area']
        elif 'fo' in request.GET:
            areas = execute_query("""
                SELECT area From fo_area WHERE fo_name='%s'""" % request.GET['fo'])
            filter_query = " AND ("
            for i in areas:
                filter_query += "area='%s' OR " % i['area']
            # change last logic operator to and
            filter_query = filter_query[:-3]
            filter_query += ")"
        query = """
        SELECT count(DISTINCT
            stockpoint_id) as count, area, DATE_FORMAT(date, '%%b-%%y') AS month
        FROM
            sale_db
        where stockpoint_id>0
            %s
        GROUP BY area , DATE_FORMAT(date, '%%b-%%y')
        ORDER BY STR_TO_DATE(month, '%%b-%%y')
        """ % filter_query
        result = execute_query(query)

        json_str = json.dumps(result, default=defaultencode)
        return HttpResponse(json_str, content_type="application/json")

# get estimated man hour

@login_required(login_url='/login/')
def estimated_man_hour(request):
    if request.method == 'GET':
        filter_query = ' '
        if 'area' in request.GET:
            filter_query = " AND area='%s'" % request.GET['area']
        elif 'fo' in request.GET:
            areas = execute_query("""
                SELECT area From fo_area WHERE fo_name='%s'""" % request.GET['fo'])
            filter_query = " AND ("
            for i in areas:
                filter_query += "area='%s' OR " % i['area']
            # change last logic operator to and
            filter_query = filter_query[:-3]
            filter_query += ")"
        query = """
        SELECT 
            SUM(hours_per_day) AS count,
            area,
            DATE_FORMAT(date, '%%b-%%y') AS month
        FROM
            (SELECT 
                uplifter_id, hours_per_day, area, date
            FROM
                sale_db      
            WHERE
                uplifter_id > 0
                %s
            GROUP BY date , uplifter_id
            ORDER BY date) AS t
        GROUP BY area , month
        ORDER BY STR_TO_DATE(month, '%%b-%%y');
        """ % filter_query
        result = execute_query(query)

        json_str = json.dumps(result, default=defaultencode)
        return HttpResponse(json_str, content_type="application/json")



################## Dashboard - Shareout #####################

@login_required(login_url='/login/')
def sp_three_month_income(request):
    if request.method == 'GET':
        area = request.GET['area']
        this_month = request.GET['month']
        this_month = datetime.datetime.strptime(this_month, "%b-%y")
        (this_month_first_day, last_day) = get_month_day_range(this_month)

        three_month_ago = get_pre_month(get_pre_month(this_month))
        (three_month_ago_first_day, three_month_ago_last_day) = get_month_day_range(three_month_ago)
        query = """
        SELECT 
            SUM(stockpoint_profit) as profit,
            stockpoint_name,
            DATE_FORMAT(date, '%%b-%%y') AS month
        FROM
            sale_db
        WHERE
            area = '%s' and (date BETWEEN "%s" AND "%s")
        GROUP BY stockpoint_name , month
        """ % (area, three_month_ago_first_day.strftime("%Y-%m-%d"), last_day.strftime("%Y-%m-%d"))
        result = execute_query(query)

        json_str = json.dumps(result, default=defaultencode)
        return HttpResponse(json_str, content_type="application/json")

# sum of peso for each stokpoint, each month

@login_required(login_url='/login/')
def sp_three_month_purchase_value(request):
    if request.method == 'GET':
        area = request.GET['area']
        this_month = request.GET['month']
        this_month = datetime.datetime.strptime(this_month, "%b-%y")
        (this_month_first_day, last_day) = get_month_day_range(this_month)

        three_month_ago = get_pre_month(get_pre_month(this_month))
        (three_month_ago_first_day, three_month_ago_last_day) = get_month_day_range(three_month_ago)
        query = """
        SELECT 
            SUM(peso) AS value_purchase,
            stockpoint_name,
            DATE_FORMAT(date, '%%b-%%y') AS month
        FROM
            delivery
        WHERE
            stockpoint_name <> 'LP4Y' and area="%s" and (date BETWEEN "%s" AND "%s")
        GROUP BY month, stockpoint_name
        ORDER BY stockpoint_name, date 
        """ % (area, three_month_ago_first_day.strftime("%Y-%m-%d"), last_day.strftime("%Y-%m-%d"))
        result = execute_query(query)

        json_str = json.dumps(result, default=defaultencode)
        return HttpResponse(json_str, content_type="application/json")

# get uplifters income and man hour given area and month

@login_required(login_url='/login/')
def ul_income_and_man_hour(request):
    if request.method == 'GET':
        area = request.GET['area']
        month = request.GET['month']
        # man hour
        query1 = """
        SELECT 
            *
        FROM
            (SELECT 
                SUM(hours_per_day) AS man_hour_sum,
                    uplifter_name,
                    area,
                    DATE_FORMAT(date, '%%b-%%y') AS month
            FROM
                (SELECT 
                uplifter_id, uplifter_name, hours_per_day, area, date
            FROM
                sale_db
            WHERE
                uplifter_id > 0
                    AND uplifter_name IS NOT NULL
                    AND area = '%s'
            GROUP BY date , uplifter_id
            ORDER BY date) AS t
            GROUP BY uplifter_id , month
            ORDER BY uplifter_name, STR_TO_DATE(month, '%%b-%%y')) AS t2
        WHERE
            t2.month = '%s'
        """ % (area, month)

        query2 = """
        SELECT 
            SUM(t.profit) AS profit, uplifter_name, month, area
        FROM
            (SELECT 
                uplifter_id,
                    uplifter_name,
                    SUM(uplifter_profit) AS profit,
                    hours_per_day,
                    area,
                    DATE_FORMAT(date, '%%b-%%y') AS month
            FROM
                sale_db
            WHERE
                uplifter_id > 0
            GROUP BY date , uplifter_id) AS t
        WHERE
            t.uplifter_id > 0
                AND area = '%s'and t.month="%s"
        GROUP BY uplifter_id , month
        ORDER BY uplifter_name, STR_TO_DATE(month, '%%b-%%y')
        """ % (area, month)

        result = {}
        result['man_hour'] = execute_query(query1)
        result['income'] = execute_query(query2)

        json_str = json.dumps(result, default=defaultencode)
        return HttpResponse(json_str, content_type="application/json")

# compare the days worked for ul between this month and previous month

@login_required(login_url='/login/')
def most_improved_days_worked(request):
    if request.method == 'GET':
        this_month_str = request.GET['month']
        area = request.GET['area']
        this_month_date = datetime.datetime.strptime(this_month_str, "%b-%y")
        pre_month = get_pre_month(this_month_date)
        pre_month_str = pre_month.strftime("%b-%y")

        query = """
        SELECT 
            *
        FROM
            (SELECT 
                COUNT(DISTINCT date) AS count,
                    uplifter_id,
                    uplifter_name,
                    DATE_FORMAT(date, '%%b-%%y') AS month
            FROM
                sale_db
            WHERE
                area = '%s' AND uplifter_name <> ''
            GROUP BY uplifter_id , month) AS t
        WHERE
            t.month = '%s' OR t.month = '%s'
        ORDER BY t.uplifter_name;
        """ % (area, this_month_str, pre_month_str)
        result = execute_query(query)

        json_str = json.dumps(result, default=defaultencode)
        return HttpResponse(json_str, content_type="application/json")

# get the product delivery quantity for stockpoint per month

@login_required(login_url='/login/')
def product_sold_detail(request):
    if request.method == 'GET':
        stockpoint_name = request.GET['stockpoint_name']
        this_month = request.GET['month']
        this_month = datetime.datetime.strptime(this_month, "%b-%y")
        (this_month_first_day, this_month_last_day) = get_month_day_range(this_month)

        three_month_ago = get_pre_month(get_pre_month(this_month))
        (three_month_ago_first_day, three_month_ago_last_day) = get_month_day_range(three_month_ago)
        query1 = """
        SELECT 
            SUM(qty) AS sum,
            DATE_FORMAT(date, '%%b-%%y') AS month,
            product,
            stockpoint_name
        FROM
            delivery
        WHERE
            stockpoint_name = '%s'
            AND (date BETWEEN "%s" AND "%s")
        GROUP BY month , product , stockpoint_id
        """ % (stockpoint_name,three_month_ago_first_day.strftime("%Y-%m-%d"), this_month_last_day.strftime("%Y-%m-%d"))
        
        query2 = """
        SELECT 
            COUNT(DISTINCT uplifter_id) AS sum,
            DATE_FORMAT(date, '%%b-%%y') AS month
        FROM
            sale_db
        WHERE
            stockpoint_name = '%s'
                AND date BETWEEN '%s' AND '%s'
        GROUP BY month
        """ % (stockpoint_name, three_month_ago_first_day.strftime("%Y-%m-%d"), this_month_last_day.strftime("%Y-%m-%d"))

        result = {}
        result['product'] = execute_query(query1)
        result['ul_count'] = execute_query(query2)

        json_str = json.dumps(result, default=defaultencode)
        return HttpResponse(json_str, content_type="application/json")












####################### Helper Functions ############################

# helper function to executing custom query

def execute_query(query):
    cursor = connections['projectbloom_data'].cursor()
    cursor.execute(query)
    desc = cursor.description
    row = [
        dict(zip([col[0] for col in desc], row))

        for row in cursor.fetchall()
    ]
    cursor.close()

    return row


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
        start_date = end_date - \
            datetime.timedelta(weeks=4) + datetime.timedelta(days=1)
        periods = period_generator(start_date, end_date, date_format, option)
    else:
        today = datetime.datetime.now()
        days_left_for_this_week = 6 - datetime.datetime.today().weekday()
        end_date = today + datetime.timedelta(days=days_left_for_this_week)
        start_date = end_date - \
            datetime.timedelta(weeks=4) + datetime.timedelta(days=1)
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
    first_day = date.replace(day=1)
    last_day = date.replace(day=calendar.monthrange(date.year, date.month)[1])
    return first_day, last_day

# helper function for getting the week period from given start date and
# end date


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
                period['end_date'] = (
                    current_start_date + time_delta - one_day).strftime(date_format)
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
            current_month_range = get_month_day_range(
                current_month_range[1] + one_day)
    return periods

# helper function for getting previous month
def get_pre_month(date):
    first = date.replace(day=1)
    lastMonth = first - datetime.timedelta(days=1)
    return lastMonth

# helper function for generating query for stockpoint product sold table


def generate_sp_product_sold_table_query(periods):
    query_part_1 = ""
    query_part_2 = ""
    col_name = []
    # use start date as the column name
    for period in periods:
        col_name.append(period['start_date'])
        query_part_1 += "sum(`%s`) as `%s`,\n" % (
            period['start_date'], period['start_date'])
        query_part_2 += "case when date between '%s' and '%s' then sold end as `%s`,\n" % (
            period['start_date'], period['end_date'], period['start_date'])
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
    query += """from sale_db  as t where area is not null and stockpoint_name is not null and product is not null)
    as t2
    group by stockpoint_name, product
    order by area, stockpoint_name, product\n"""

    return (query, col_name)

# helper function for generating query for uplifter worked days


def generate_ul_worked_days_query(periods):
    query_part_1 = ""
    query_part_2 = ""
    col_name = []
    # use start date as the column name
    for period in periods:
        col_name.append(period['start_date'])
        query_part_1 += "count(distinct `%s`) as `%s`,\n" % (
            period['start_date'], period['start_date'])
        query_part_2 += "case when date between '%s' and '%s' then date end as `%s`,\n" % (
            period['start_date'], period['end_date'], period['start_date'])
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
    query += """from sale_db as t where area is not null and stockpoint_name is not null and uplifter_name is not null and uplifter_name <> '')
    as t2
    group by uplifter_name
    order by area, stockpoint_name, uplifter_name\n"""

    return (query, col_name)

# helper function for generating uplifter income over period query, can be
# weekly or monthly


def generate_ul_income_query(periods):
    query_part_1 = ""
    query_part_2 = ""
    col_name = []
    # use start date as the column name
    for period in periods:
        col_name.append(period['start_date'])
        query_part_1 += "sum(`%s`) as `%s`,\n" % (
            period['start_date'], period['start_date'])
        query_part_2 += "case when date between '%s' and '%s' then uplifter_profit end as `%s`,\n" % (
            period['start_date'], period['end_date'], period['start_date'])
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
    query += """from sale_db as t where area is not null and stockpoint_name is not null and uplifter_name is not null and uplifter_name <> '')
    as t2
    group by uplifter_name
    order by area, stockpoint_name, uplifter_name\n"""

    return (query, col_name)

def generate_ul_status_query(periods):
    query = """
    SELECT 
        name, month, status
    FROM
        entrepreneur_status
    WHERE
        (type = 'TSPI_UL'
            OR type = 'LP4Y_UL')
            AND (
    """
    col_name = []
    for period in periods:
        col_name.append(period['start_date'])
        month = datetime.datetime.strptime(period['start_date'], "%Y-%m-%d")
        month = month.strftime("%b-%y")
        query += """
        month ='%s' OR """ % (month)

    query = query[:-3]
    query += """
    );
    """
    return query


# helper function for generating stockpoint monthly income query
def generate_sp_income_query(periods):
    query_part_1 = ""
    query_part_2 = ""
    col_name = []
    # use start date as the column name
    for period in periods:
        col_name.append(period['start_date'])
        query_part_1 += "sum(`%s`) as `%s`,\n" % (
            period['start_date'], period['start_date'])
        query_part_2 += "case when date between '%s' and '%s' then stockpoint_profit end as `%s`,\n" % (
            period['start_date'], period['end_date'], period['start_date'])
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
    query += """from sale_db as t where area is not null and stockpoint_name is not null)
    as t2
    group by stockpoint_name
    order by area, stockpoint_name\n"""

    return (query, col_name)

def generate_sp_status_query(periods):
    query = """
    SELECT 
        name, month, status
    FROM
        entrepreneur_status
    WHERE
        (type = 'TSPI_SP'
            OR type = 'LP4Y_SP')
            AND (
    """
    col_name = []
    for period in periods:
        col_name.append(period['start_date'])
        month = datetime.datetime.strptime(period['start_date'], "%Y-%m-%d")
        month = month.strftime("%b-%y")
        query += """
        month ='%s' OR """ % (month)

    query = query[:-3]
    query += """
    );
    """
    return query

# helper function for generating bloom overview query


def generate_bloom_overview_query(params, type, month):
    filter_query = ' '
    filter_query2 = ''
    if 'area' in params:
        filter_query = "area='%s' AND " % params['area']
    elif 'fo' in params:
        areas = execute_query("""
            SELECT area From fo_area WHERE fo_name='%s'""" % params['fo'])
        filter_query = "("
        for i in areas:
            filter_query += "area='%s' OR " % i['area']
        # change last logic operator to and
        filter_query = filter_query[:-3]
        filter_query += ") AND "
    if month is not None:
        filter_query2 = "AND t2.month='%s'" % month

    if type == 'ul_overview':
        query = """
            SELECT 
            COUNT(*) as count, t2.month, t2.status
            FROM
                (SELECT 
                    t.month AS month,
                        (CASE
                            WHEN t.status = 'N1' OR t.status = 'N2' THEN 'N'
                            WHEN t.status = 'D1' THEN 'D'
                            ELSE t.status
                        END) AS status,
                        t.type
                FROM
                    entrepreneur_status AS t  
                WHERE
                EXISTS( SELECT 
                    *
                FROM
                    entrepreneur
                WHERE
                    {0}
                    entrepreneur.id = t.entrepreneur_id and entrepreneur.role = 'Uplifter')
            ) AS t2
            WHERE
                (t2.type = 'TSPI_UL'
                    OR t2.type = 'LP4Y_UL')
                    AND t2.status IS NOT NULL
                    AND t2.status <> 'D2'
                    AND t2.status <> 'NP1'
                    AND t2.status <> 'NP2'
                    {1}
            GROUP BY t2.month , t2.status
            ORDER BY STR_TO_DATE(t2.month, '%b-%y');
        """.format(filter_query, filter_query2)
    elif type == 'sp_overview':
        query = """
            SELECT 
                COUNT(*) as count, t2.month, t2.status
            FROM
                (SELECT 
                    t.month AS month,
                        (CASE
                            WHEN t.status = 'N1' OR t.status = 'N2' THEN 'N'
                            WHEN t.status = 'D1' THEN 'D'
                            ELSE t.status
                        END) AS status,
                        t.type
                FROM
                    entrepreneur_status AS t
                WHERE
                EXISTS( SELECT 
                    *
                FROM
                    entrepreneur
                WHERE
                    {0}
                    entrepreneur.id = t.entrepreneur_id and entrepreneur.role = 'Stockpoint')
            ) AS t2
            WHERE
                (t2.type = 'TSPI_SP'
                    OR t2.type = 'LP4Y_SP')
                    AND t2.status IS NOT NULL
                    AND t2.status <> 'D2'
                    AND t2.status <> 'NP1'
                    AND t2.status <> 'NP2'
                    {1}
            GROUP BY t2.month , t2.status
            ORDER BY STR_TO_DATE(t2.month, '%b-%y');
        """.format(filter_query, filter_query2)
    elif type == 'ul_without_lp4y_overview':
        query = """
            SELECT 
                COUNT(*) as count, t2.month, t2.status
            FROM
                (SELECT 
                    t.month AS month,
                        (CASE
                            WHEN t.status = 'N1' OR t.status = 'N2' THEN 'N'
                            WHEN t.status = 'D1' THEN 'D'
                            ELSE t.status
                        END) AS status,
                        t.type
                FROM
                    entrepreneur_status AS t
                WHERE
                EXISTS( SELECT 
                    *
                FROM
                    entrepreneur
                WHERE
                    {0}
                    entrepreneur.id = t.entrepreneur_id and entrepreneur.role = 'Uplifter')
                    ) AS t2
            WHERE
                    t2.type = 'TSPI_UL'
                    AND t2.status IS NOT NULL
                    AND t2.status <> 'D2'
                    AND t2.status <> 'NP1'
                    AND t2.status <> 'NP2'
                    {1}
            GROUP BY t2.month , t2.status
            ORDER BY STR_TO_DATE(t2.month, '%b-%y');
        """.format (filter_query, filter_query2)

    return query
