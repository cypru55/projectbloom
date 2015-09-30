/* 
 * @Author: archer
 * @Date:   2015-08-13 15:34:44
 * @Last Modified 2015-09-30
 */

'use strict';

// Define angular controllers
var dashboardControllers = angular.module('dashboardControllers', []);

// color scheme
var color = {
	stable_ul: '#0099CC',
	stable_active_ul: '#66CCFF',
	stable_inactive_ul: '#0066FF',
	prescreened: '#E6E6E6',
	new_ul: '#00CC66',
	stable_sp: '#FF9900',
	new_sp: '#FFFF66',
	drop: '#FF0000',
	retention: '#993300',
	black: '#000000',
	dm50: '#00CC00',
	jf50: '#FFCC00',
	snickers20: '#CC6600',
	sugus34: '#FF6666',
	mm14: '#0066CC',
	wrigleyothers: '#C1C1AF',
	mars: '#0066CC',
	wrigley: '#00CC00',
	total: '#FF6600',
	wrigleyline: '#009933',
	marsline: '#0033CC'

}

dashboardControllers.controller('DashboardMonthlyCtrl', ['$scope', '$routeParams', '$http',
	function($scope, $routeParams, $http) {


		$http.get('../api/last-full-data-month').success(function(data) {
			var last_fully_updated_month = data[0].value;
			$scope.last_full_data_month = last_fully_updated_month
			var tabSelectListener = function() {
				var el = this;
				// find the tab to activate
				var tabid = '#' + el.id.split('-')[0] + '-tab a';
				$(this).tab('show');
				var id = el.id;

				var params = {};
				var title = '';

				if (id == 'bloom-overview') {
					var params = {};
					title = 'Bloom'
					$scope.fo_name = 'Bloom';
					$scope.area = 'Overall';
				} else if (id.indexOf('fo-') === 0) {
					var fo_name = id.split('-')[1];
					params['fo'] = fo_name;
					title = fo_name;
					$scope.fo_name = fo_name;
					$scope.area = 'Overall';

				} else {
					params['area'] = id.split('-')[1];
					title = id.split('-')[1];
					$scope.fo_name = id.split('-')[0];
					$scope.area = id.split('-')[1];
				}

				if ($routeParams.tab == 'kpi') {
					retriveAndDrawKPIChart(params, title, last_fully_updated_month, $scope, $http)
				} else if ($routeParams.tab == 'add') {
					retriveAndDrawAdditionalCharts(params, title, last_fully_updated_month, $scope, $http);
				}

			}
			initializeTab($http, $scope, $routeParams.tab, last_fully_updated_month, tabSelectListener);

			var params = {}
			$scope.fo_name = "Bloom"
			$scope.area = "Overall"
			if ($routeParams.tab == 'kpi') {
				retriveAndDrawKPIChart(params, "Bloom", last_fully_updated_month, $scope, $http);
				$('#tab2').hide();
				$('#tab1').show();
			} else if ($routeParams.tab == 'add') {
				retriveAndDrawAdditionalCharts(params, "Bloom", last_fully_updated_month, $scope, $http);
				$('#tab1').hide();
				$('#tab2').show();
			}
		})


	}
]);

dashboardControllers.controller('DashboardShareoutCtrl', ['$scope', '$http',
	function($scope, $http) {
		$http.get('../api/last-full-data-month').success(function(data) {
			var last_fully_updated_month = data[0].value;
			// initialize $scope variables
			$scope.last_full_data_month = last_fully_updated_month;
			$scope.selected_area = '';
			$scope.selected_month = '';
			$scope.selected_sp_name = '';
			$scope.sp_under_area = [];
			$scope.stockpoints = {}
			$scope.areas = []

			// initialize area and month selection (actually also include the sp drop down menu)
			initializeAreaMonthSelection($http, $scope, last_fully_updated_month);
		})

	}
]);

dashboardControllers.controller('DashboardQuaterlyCtrl', ['$scope', '$http',
	function($scope, $http) {

	}
]);

dashboardControllers.controller('DashboardRecruitmentMTDCtrl', ['$scope', '$http',
	function($scope, $http) {
		// since it is mtd, we use now as last_fully_updated_month
		var until_month = moment().format('MMM-YY');
		var tabSelectListener = function() {
			var el = this;
			// find the tab to activate
			var tabid = '#' + el.id.split('-')[0] + '-tab a';
			$(this).tab('show');
			var id = el.id;

			var params = {};
			var title = '';

			if (id == 'bloom-overview') {
				var params = {};
				title = 'Bloom'
				$scope.fo_name = 'Bloom';
				$scope.area = 'Overall';
			} else if (id.indexOf('fo-') === 0) {
				var fo_name = id.split('-')[1];
				params['fo'] = fo_name;
				title = fo_name;
				$scope.fo_name = fo_name;
				$scope.area = 'Overall';

			} else {
				params['area'] = id.split('-')[1];
				title = id.split('-')[1];
				$scope.fo_name = id.split('-')[0];
				$scope.area = id.split('-')[1];
			}
			//use digest to update scope variable in view
			$scope.$digest();
			retriveAndDrawRecruitmentMTDCharts(params, title, $scope, $http);

		}
		initializeTab($http, $scope, null, until_month, tabSelectListener);

		// initialize the view with default
		var params = {}
		$scope.fo_name = "Bloom"
		$scope.area = "Overall"
		retriveAndDrawRecruitmentMTDCharts(params, "Bloom", $scope, $http);
	}
]);

dashboardControllers.controller('DashboardOpReportCtrl', ['$scope', '$routeParams', '$http',
	function($scope, $routeParams, $http) {
		switch ($routeParams.report_type) {
			case 'weekly_fo_sub':
				setupWeeklyFOSubmission($scope, $http);
				break;
			case 'challenge_action':
				setupChallengeAction($scope, $http);
				break;
			case 'mtd_delivery':
				setupDeliveryReport($scope, $http);
				break;
		}
		toggle_tab('tab_content', $routeParams.report_type);
	}
]);

dashboardControllers.controller('DashboardTableCtrl', ['$scope', '$routeParams', '$http',
	function($scope, $routeParams, $http) {
		$scope.sortHeader = '';
		$scope.params = {
				page: 1,
				ordering: '',
				search: ''
			}
			// Set title
		var url;
		if ($routeParams.data_type == 'sale') {
			$scope.title = 'Sale Table'
			$scope.type = "";
			url = '../api/' + $routeParams.data_type;
			$('#product-margin-type-selector').hide();

		} else if ($routeParams.data_type == 'product') {
			$scope.title = 'Product Margin Table'
			url = '../api/' + $routeParams.data_type + '/latest';
			$scope.type = '- latest';
			$('#product-margin-type-selector').show();


			// add listener for list selector

		} else if ($routeParams.data_type == 'delivery') {
			$scope.title = 'Delivery Table'
			$scope.type = "";
			url = '../api/' + $routeParams.data_type;
			$('#product-margin-type-selector').hide();

		} else if ($routeParams.data_type == 'entrepreneur') {
			$scope.title = 'Entrepreneur Table'
			$scope.type = "";
			url = '../api/' + $routeParams.data_type;
			$('#product-margin-type-selector').hide();

		}

		// setup the product margin type selector
		$('#product-margin-type-list').click(function(event) {
			var type = event.target.getAttribute("value");
			url = "../api/product_margin/" + type;
			$scope.type = '- ' + type;
			retriveAndDrawDataTable(url, $scope.params, 10, $http, $scope, $('#data-table-paginator'));
		});

		// setup paginator
		var options = {
			bootstrapMajorVersion: 3,
			useBootstrapTooltip: true,
			onPageClicked: function(e, originalEvent, type, page) {
				$scope.params.page = page
				retriveAndDrawDataTable(url, $scope.params, 10, $http, $scope, $('#data-table-paginator'));
			},
			itemContainerClass: function(type, page, current) {
				return (page === current) ? "active" : "pointer-cursor";
			}
		}

		$('#data-table-paginator').bootstrapPaginator(options);
		retriveAndDrawDataTable(url, $scope.params, 10, $http, $scope, $('#data-table-paginator'))

		// add watch to params
		$scope.$watchCollection(
			function(scope) {
				return scope.params
			},
			function(newValue, oldValue) {
				if (JSON.stringify(newValue) === JSON.stringify(oldValue)) {
					return;
				}
				retriveAndDrawDataTable(url, $scope.params, 10, $http, $scope, $('#data-table-paginator'));

			}
		);

		$scope.reorder = function(sortHeader) {
			$scope.sortHeader = sortHeader;
			var orderingItem = $scope.sortHeader.replace(/\s+/g, '_').toLowerCase()
			$scope.params['ordering'] = orderingItem;
		}


	}
]);

dashboardControllers.controller('DashboardPivotCtrl', ['$scope', '$routeParams', '$http',
	function($scope, $routeParams, $http) {
		// initializing local variables
		var url;
		var params = {
			option: 'monthly'
		};
		$scope.type = 'monthly'
		var headers = []

		// initialize date picker
		var today = moment();
		var four_weeks_ago = moment();
		four_weeks_ago.subtract(27, 'days');
		var four_months_ago = moment().subtract(3, 'months');
		params['sd'] = four_months_ago.format('YYYY-MM-DD');
		params['ed'] = today.format('YYYY-MM-DD');

		$('#datepicker-month').datepicker({
			orientation: 'auto',
			format: 'yyyy/mm/dd',
			viewMode: "months",
			minViewMode: 'months',
			startDate: '2014/06/01',
		}).on('changeDate', function(e) {
			switch (e.target.id) {
				case 'date-picker-start':
					params['sd'] = e.format("yyyy-mm-dd");
					break;
				case 'date-picker-end':
					params['ed'] = e.format("yyyy-mm-dd");
					break;
			}

			// retrive pivot table
			retriveAndDrawPivotTable(url, params, headers, $http, $scope);
		});

		$('#datepicker-week').datepicker({
			orientation: 'auto',
			format: 'yyyy/mm/dd',
			viewMode: "days",
			minViewMode: 'days',
			startDate: '2014/06/01',

		}).on('changeDate', function(e) {
			switch (e.target.id) {
				case 'date-picker-start':
					params['sd'] = e.format("yyyy-mm-dd");
					break;
				case 'date-picker-end':
					params['ed'] = e.format("yyyy-mm-dd");
					break;
			}


			// retrive pivot table
			retriveAndDrawPivotTable(url, params, headers, $http, $scope);
		});
		$('#datepicker-week').hide()

		// set default to 4 months agon to today
		$('#datepicker-month #date-picker-start').datepicker('update', four_months_ago.toDate());
		$('#datepicker-month #date-picker-end').datepicker('update', today.toDate());

		// configure the url according to pivot table type
		switch ($routeParams['table_type']) {
			case 'sp_products_sold':
				$scope.title = "Stockpoint Products Sold";
				url = '../api/sale/sp-products-sold'
				headers = ['area', 'stockpoint_name', 'product']
				retriveAndDrawPivotTable(url, params, headers, $http, $scope);
				break;
			case 'ul_days_worked':
				$scope.title = "Uplifter Days Worked";
				url = '../api/sale/ul-days-worked'
				headers = ['area', 'stockpoint_name', 'uplifter_name']
				retriveAndDrawPivotTable(url, params, headers, $http, $scope);
				break;
			case 'ul_income':
				$scope.title = "Uplifter Income";
				url = '../api/sale/ul-income'
				headers.push('uplifter_name')
				headers = ['area', 'stockpoint_name', 'uplifter_name']
				retriveAndDrawPivotTable(url, params, headers, $http, $scope);
				break;
			case 'sp_income':
				$scope.title = "Stockpoint Income";
				url = '../api/sale/sp-income'
				headers = ['area', 'stockpoint_name']
				retriveAndDrawPivotTable(url, params, headers, $http, $scope);
				break;
		}

		// setup the period type selector
		$('#pivot-table-option-list').click(function(event) {
			params['option'] = event.target.getAttribute("value");
			$scope.type = event.target.getAttribute("value");
			switch ($scope.type) {
				case 'monthly':
					$('#datepicker-month').show()
					$('#datepicker-month #date-picker-start').datepicker('update', four_months_ago.toDate());
					$('#datepicker-month #date-picker-end').datepicker('update', today.toDate());
					params['sd'] = four_months_ago.format('YYYY-MM-DD');
					params['ed'] = today.format('YYYY-MM-DD');
					$('#datepicker-week').hide();
					break;
				case 'weekly':
					$('#datepicker-week').show()
						// set default to 4 weeks agon to today
					$('#datepicker-week #date-picker-start').datepicker('update', four_weeks_ago.toDate());
					$('#datepicker-week #date-picker-end').datepicker('update', today.toDate());
					params['sd'] = four_weeks_ago.format('YYYY-MM-DD');
					params['ed'] = today.format('YYYY-MM-DD');
					$('#datepicker-month').hide()
					break;
			}
			retriveAndDrawPivotTable(url, params, headers, $http, $scope);
		});

	}
]);

dashboardControllers.controller('DashboardSurveyCtrl', ['$scope', '$http',
	function($scope, $http) {
		console.log('survey')
	}
]);

dashboardControllers.controller('DashboardFormCtrl', ['$scope', '$http',
	function($scope, $http) {
		console.log('d')
	}
]);

dashboardControllers.controller('DashboardExportCtrl', ['$scope', '$http',
	function($scope, $http) {
		$('#entrepreneur_csv').click(function() {
			parseJsonToCsv($http, '../api/entrepreneur/?page_size=100000000', 'entrepreneur.csv');
		});
		$('#sale_csv').click(function() {
			parseJsonToCsv($http, '../api/sale/?page_size=50000', 'sale.csv');
		});
		$('#delivery_csv').click(function() {
			parseJsonToCsv($http, '../api/delivery/?page_size=100000000', 'delivery.csv');
		});
		$('#product_csv').click(function() {
			parseJsonToCsv($http, '../api/product/all?page_size=100000000', 'product.csv');
		});
	}
]);

/**
 * Helper function for retriving data
 */
function retriveAndDrawDataTable(url, params, page_size, $http, $scope, table) {
	// add page number to http get parameter
	// url = url + '?page=' + page_num;

	// retrive data
	$http.get(appendParamsToUrl(url, params)).success(function(data) {
		var header_structure = [];
		for (var k in data.results[0]) {
			header_structure.push({
				"data": parseHeader(k)
			});
		}

		// update page size and total page
		var newOption = {
			totalPages: Math.ceil(data.count / page_size),
		}
		table.bootstrapPaginator(newOption);

		// update view
		$scope.headers = header_structure;
		$scope.sales = data.results;
		$scope.z = data.count;
		$scope.x = (params.page - 1) * page_size + 1;
		if (params.page * page_size < data.count) {
			$scope.y = params.page * page_size;
		} else {
			$scope.y = data.count;
		}

	});
}

/**
 * Helper function for appending parameters and retrive pivot table
 */
function retriveAndDrawPivotTable(url, params, headers, $http, $scope) {
	var url_with_param = url;
	if (params.ed == undefined || params.sd == undefined || params.option == undefined) {
		return;
	} else if (params.ed == params.sd) {
		$('#dataTable').hide();
		$('#paginator-div').hide();
		$('#no-data-sign').show();
		return;
	}


	// send http get request
	$http.get(appendParamsToUrl(url, params)).success(function(data) {
		if (data.data.length > 0) {
			$scope.color_code = {}
			$('#dataTable').show();
			$('#paginator-div').show();
			$('#no-data-sign').hide();
			// to determine the starting of the date columns
			$scope.data_column_start_index = headers.length;
			var header_structure = headers.concat(data.headers);
			var parsed_headers = []
			for (var k in header_structure) {
				parsed_headers.push(parseHeader(header_structure[k], params.option));

			}
			// update view
			$scope.header_structure = header_structure;
			$scope.parsed_headers = parsed_headers;
			$scope.data = data.data;

			// if type is monthly and is income, show status color code
			if (params.option == 'monthly' && url == '../api/sale/sp-income') {
				var color_code = {}
				for (var i in data.status) {
					var name = data.status[i].name;
					if (!(name in color_code)) {
						color_code[name] = {}
					}
					var firstDayOfMonth = moment(data.status[i].month, 'MMM-YY')
					firstDayOfMonth = firstDayOfMonth.format('YYYY-MM-DD')
					switch (data.status[i].status) {
						case 'N1':
						case 'N2':
							color_code[name][firstDayOfMonth] = color.new_sp;
							break;
						case 'S':
							color_code[name][firstDayOfMonth] = color.stable_sp;
							break;
						case 'D1':
						case 'D2':
							color_code[name][firstDayOfMonth] = color.drop;
							break;
					}
				}
				// show the color legend
				$('#sp-color-legend').show();
				$scope.new_sp_color = color.new_sp;
				$scope.stable_sp_color = color.stable_sp;
				$scope.dropped_sp_color = color.drop;
				$scope.pk_col = headers[headers.length - 1];
				$scope.color_code = color_code;
			} else if (params.option == 'monthly' && url == '../api/sale/ul-income') {
				var color_code = {}
				for (var i in data.status) {
					var name = data.status[i].name;
					if (!(name in color_code)) {
						color_code[name] = {}
					}
					var firstDayOfMonth = moment(data.status[i].month, 'MMM-YY')
					firstDayOfMonth = firstDayOfMonth.format('YYYY-MM-DD')
					switch (data.status[i].status) {
						case 'N1':
						case 'N2':
							color_code[name][firstDayOfMonth] = color.new_ul;
							break;
						case 'S':
							color_code[name][firstDayOfMonth] = color.stable_active_ul;
							break;
						case 'S1':
						case 'S2':
							color_code[name][firstDayOfMonth] = color.stable_inactive_ul;
							break;
						case 'D1':
						case 'D2':
							color_code[name][firstDayOfMonth] = color.drop;
							break;
					}
				}

				// show the color legend
				$('#ul-color-legend').show();
				$scope.new_ul_color = color.new_ul;
				$scope.stable_ul_a_color = color.stable_active_ul;
				$scope.stable_ul_ia_color = color.stable_inactive_ul;
				$scope.dropped_ul_color = color.drop;
				$scope.pk_col = headers[headers.length - 1];
				$scope.color_code = color_code;

			}
		} else {
			$('#dataTable').hide();
			$('#paginator-div').hide();
			$('#no-data-sign').show();

		}

	});
}

/**
 * Draw monthly kpi charts
 */
function retriveAndDrawKPIChart(params, title, last_fully_updated_month, $scope, $http) {
	// http get for recruitment, ul, sp retention chart
	$http.get(appendParamsToUrl('../api/overview', params)).success(function(data) {
		//parse ajax data to data array
		var startDate = moment('2014/6/1', 'YYYY-MM-DD');
		var now = moment(last_fully_updated_month, 'MMM-YY');
		now.add(1, 'months');
		var data_array = [];
		while (monthDiff(startDate, now) != 0) {
			data_array.push(
				[new Date(startDate.format('YYYY-MM-DD')) //0 months
					, 0 //1 total stable ul
					, 0 //2 new ul
					, 0 //3 dropped ul
					, 0 //4 stable sp
					, 0 //5 new sp
					, 0 //6 dropped sp
					, 0 //7 total stable ul without lp4y
					, 0 //8 new ul without lp4y
					, 0 //9 dropped ul without lp4y
				]
			);

			startDate.add(1, 'months');
		}

		// parse data from ajax for first chart, all original
		for (var i in data['ul_overview']) {
			var month = moment(data['ul_overview'][i]['month'], "MMM-YY");
			var startDate = moment('2014/6/1', 'YYYY-MM-DD');
			var index = monthDiff(startDate, month);
			if (index >= data_array.length) {
				continue;
			}
			if (data['ul_overview'][i]['status'] == 'S' || data['ul_overview'][i]['status'] == 'S1' || data['ul_overview'][i]['status'] == 'S2') {
				data_array[index][1] += data['ul_overview'][i]['count']

			} else if (data['ul_overview'][i]['status'] == 'N') {
				data_array[index][2] = data['ul_overview'][i]['count']
			} else if (data['ul_overview'][i]['status'] == 'D') {
				data_array[index][3] = data['ul_overview'][i]['count']
			}
		}

		for (var i in data['sp_overview']) {
			var month = moment(data['sp_overview'][i]['month'], "MMM-YY");
			var startDate = moment('2014/6/1', 'YYYY-MM-DD');
			var index = monthDiff(startDate, month);
			if (index >= data_array.length) {
				continue;
			}
			if (data['sp_overview'][i]['status'] == 'S') {
				data_array[index][4] = data['sp_overview'][i]['count']
			} else if (data['sp_overview'][i]['status'] == 'N') {
				data_array[index][5] = data['sp_overview'][i]['count']
			} else if (data['sp_overview'][i]['status'] == 'D') {
				data_array[index][6] = data['sp_overview'][i]['count']
			}
		}

		for (var i in data['ul_without_lp4y_overview']) {
			var month = moment(data['ul_without_lp4y_overview'][i]['month'], "MMM-YY");
			var startDate = moment('2014/6/1', 'YYYY-MM-DD');
			var index = monthDiff(startDate, month);
			if (index >= data_array.length) {
				continue;
			}
			if (data['ul_without_lp4y_overview'][i]['status'] == 'S') {
				data_array[index][7] = data['ul_without_lp4y_overview'][i]['count']
			} else if (data['ul_without_lp4y_overview'][i]['status'] == 'N') {
				data_array[index][8] = data['ul_without_lp4y_overview'][i]['count']
			} else if (data['ul_without_lp4y_overview'][i]['status'] == 'D') {
				data_array[index][9] = data['ul_without_lp4y_overview'][i]['count']
			}
		}


		// initialize options and data structure, bloom project overview
		$scope.overviewChartObject = {
			type: "ColumnChart",
			displayed: true,
			formatter: {}
		}
		var options = {
			isStacked: "true",
			fill: 20,
			displayExactValues: true,
			hAxis: {
				"format": 'MMM-yy',
				gridlines: {
					"count": 15,
					color: 'transparent'
				}
			},
			seriesType: 'bars',
			vAxis: {
				title: "Entrepreneur",
				format: '#',
				// gridlines: {
				// 	"count": 10
				// }
			},
			series: {
				4: {
					type: 'line',
					color: 'grey',
					lineWidth: 0,
					pointSize: 0,
					visibleInLegend: false
				}
			},
			lineWidth: 4,
			colors: [color.stable_ul, color.new_ul, color.stable_sp, color.new_sp],
			// width: 800,
			height: 450

		}
		var chart_data = {
			cols: [{
				id: "month",
				label: "Month",
				type: "date",
				p: {}
			}, {
				id: "total-stable-ul-id",
				label: "Total Stable UL",
				type: "number",
				p: {}
			}, {
				id: "new-ul-id",
				label: "New UL",
				type: "number",
				p: {}
			}, {
				id: "stable-sp-id",
				label: "Stable SP",
				type: "number",
				p: {}
			}, {
				id: "new-sp-id",
				label: "New SP",
				type: "number"
			}, {
				type: "number"
			}, {
				type: "number",
				role: "annotation",
				p: {
					role: "annotation"
				}

			}],
			rows: []
		}


		for (var i in data_array) {
			chart_data.rows.push({
				c: [{
					v: data_array[i][0]
				}, {
					v: data_array[i][1]
				}, {
					v: data_array[i][2]
				}, {
					v: data_array[i][4]
				}, {
					v: data_array[i][5]
				}, {
					v: data_array[i][1] + data_array[i][2] + data_array[i][4] + data_array[i][5]
				}, {
					v: data_array[i][1] + data_array[i][2] + data_array[i][4] + data_array[i][5]
				}]
			})
		}


		// update scope variable for first chart

		$scope.overviewChartObject.data = chart_data;
		$scope.overviewChartObject.options = options;


		// initialize the data structure for chart 2, uplifter retention
		$scope.ulRententionChartObject = {
			type: "ComboChart",
			displayed: true,
			formatter: {}
		}

		var chart_data2 = {
			cols: [{
				id: "month",
				label: "Month",
				type: "date",
				p: {}
			}, {
				id: "total-stable-ul-id",
				label: "Total Stable UL",
				type: "number",
				p: {}
			}, {
				type: "string",
				role: "annotation",
				p: {
					role: "annotation"
				}
			}, {
				id: "dropped-ul-id",
				label: "Dropped UL",
				type: "number",
				p: {}
			}, {
				type: "string",
				role: "annotation",
				p: {
					role: "annotation"
				}
			}, {
				id: "retention-ul-id",
				label: "Retention UL",
				type: "number",
				p: {}
			}, {
				type: "string",
				role: "annotation",
				p: {
					role: "annotation"
				}
			}],
			rows: []
		}
		for (var i in data_array) {
			var ul_retention = null;
			var retention_label = null;
			if (i != 0 && data_array[i - 1][7] != 0) {
				ul_retention = ((data_array[i - 1][7] - data_array[i][9]) / data_array[i - 1][7]).toFixed(2);
				retention_label = ul_retention * 100 + "%";
			}

			chart_data2.rows.push({
				c: [{
					v: data_array[i][0]
				}, {
					v: data_array[i][1]
				}, {
					v: data_array[i][1]
				}, {
					v: -data_array[i][3]
				}, {
					v: -data_array[i][3]
				}, {
					v: ul_retention
				}, {
					v: retention_label
				}]
			})

		}

		var options2 = {
			isStacked: "true",
			fill: 20,
			displayExactValues: true,
			hAxis: {
				format: 'MMM-yy',
				gridlines: {
					"count": 15,
					color: 'transparent'
				}
			},
			seriesType: 'bars',
			series: {
				2: {
					type: 'line',
					targetAxisIndex: 1
				},
			},
			interpolateNulls: true,
			vAxes: {
				0: {
					title: "Stable Uplifter",
					format: '#',
					// gridlines: {
					// 	"count": 10
					// }
				},
				1: {
					title: "UL Retention",
					gridlines: {
						"count": 10,
						color: 'transparent'
					},
					format: '#%',
					maxValue: 1,
					minValue: 0
				}
			},
			annotations: {
				textStyle: {
					// The color of the text.
					color: color.black,
				}
			},
			lineWidth: 4,
			colors: [color.stable_ul, color.drop, color.retention],
			// width: 800,
			height: 400
		}

		// update scope variable for first chart

		$scope.ulRententionChartObject.data = chart_data2;
		$scope.ulRententionChartObject.options = options2;

		// initialize data for chart 3， stockpoint retention
		$scope.spRetentionChartObject = {
			type: "ComboChart",
			displayed: true,
			formatter: {}
		}

		var chart_data3 = {
			cols: [{
				id: "month",
				label: "Month",
				type: "date",
				p: {}
			}, {
				id: "total-stable-sp-id",
				label: "Total Stable SP",
				type: "number",
				p: {}
			}, {
				type: "number",
				role: "annotation",
				p: {
					role: "annotation"
				}
			}, {
				id: "dropped-sp-id",
				label: "Dropped SP",
				type: "number",
				p: {}
			}, {
				type: "number",
				role: "annotation",
				p: {
					role: "annotation"
				}
			}, {
				id: "retention-sp-id",
				label: "Retention SP",
				type: "number",
				p: {}
			}, {
				type: "string",
				role: "annotation",
				p: {
					role: "annotation"
				}
			}],
			rows: []
		}

		for (var i in data_array) {
			var sp_retention = null;
			var retention_label = null;
			// we have a lp4y which is not considered when calculating stable sp, minus 1 from these 3 cases
			if (title == 'Bloom' || title == 'Mark' || title == 'Tondo') {
				if (i != 0 && data_array[i - 1][4] > 1) {
					var sp_retention = ((data_array[i - 1][4] - 1 - data_array[i][6]) / (data_array[i - 1][4] - 1)).toFixed(2);
					var retention_label = sp_retention * 100 + "%"
				}
			} else {
				if (i != 0 && data_array[i - 1][7] != 0) {
					var sp_retention = ((data_array[i - 1][4] - data_array[i][6]) / (data_array[i - 1][4])).toFixed(2);
					var retention_label = sp_retention * 100 + "%"
				}
			}
			chart_data3.rows.push({
				c: [{
					v: data_array[i][0]
				}, {
					v: data_array[i][4]
				}, {
					v: data_array[i][4]
				}, {
					v: -data_array[i][6]
				}, {
					v: -data_array[i][6]
				}, {
					v: sp_retention
				}, {
					v: retention_label
				}]
			})

		}

		var options3 = {
			isStacked: "true",
			fill: 20,
			displayExactValues: true,
			hAxis: {
				format: 'MMM-yy',
				gridlines: {
					"count": 15,
					color: 'transparent'
				}
			},
			seriesType: 'bars',
			series: {
				2: {
					type: 'line',
					targetAxisIndex: 1
				},
			},
			interpolateNulls: true,
			vAxes: {
				0: {
					title: "Stable Stockpoint",
					format: '#',
					gridlines: {
						color: 'transparent'
					}
				},
				1: {
					title: "SP Retention",
					gridlines: {
						"count": 10
					},
					format: '#%',
					maxValue: 1,
					minValue: 0
				}
			},
			annotations: {
				textStyle: {
					// The color of the text.
					color: color.black,
				}
			},
			lineWidth: 4,
			colors: [color.stable_sp, color.drop, color.retention],

			// width: 800,
			height: 400
		}

		// update scope variable for  chart

		$scope.spRetentionChartObject.data = chart_data3;
		$scope.spRetentionChartObject.options = options3;
	});


	// http get for entrepreneur tenure
	$http.get(appendParamsToUrl('../api/entrepreneur/tenure', params)).success(function(data) {
		// initialize data for uplifter tenure
		$scope.ulTenureChartObject = {
			type: "PieChart",
			displayed: true,
			formatter: {},
			options: {
				title: title + ": Total of " + data.length + " entrepreneurs",
				height: 400
			}
		}

		// build chart data and option
		var chart_data = {
			cols: [{
				id: "t",
				label: "Topping",
				type: "string"
			}, {
				id: "s",
				label: "Slices",
				type: "number"
			}],
			rows: [{
				c: [{
					v: "less than 3 months"
				}, {
					v: 0
				}, ]
			}, {
				c: [{
					v: "3 to 6 months"
				}, {
					v: 0
				}]
			}, {
				c: [{
					v: "6 to 12 months"
				}, {
					v: 0
				}, ]
			}, {
				c: [{
					v: "more than or equal 12"
				}, {
					v: 0
				}, ]
			}]
		}

		// parse data from ajax
		for (var i in data) {
			if (data[i].tenure < 3) {
				chart_data.rows[0].c[1].v += 1;
			} else if (data[i].tenure >= 3 && data[i].tenure < 6) {
				chart_data.rows[1].c[1].v += 1;
			} else if (data[i].tenure >= 6 && data[i].tenure < 12) {
				chart_data.rows[2].c[1].v += 1;
			} else if (data[i].tenure >= 12) {
				chart_data.rows[3].c[1].v += 1;
			}
		}

		//update scope varibale for tenure pie chart
		$scope.ulTenureChartObject.data = chart_data;
	});


	// estimated income per hour for stable uplifter
	$http.get(appendParamsToUrl('../api/estimated-income-per-hour', params)).success(function(data) {

		$scope.estimatedIPHForSULChartObject = {
			type: "ComboChart",
			displayed: true,
			formatter: {}
		}

		var chart_data = {
			cols: [{
				id: "month",
				label: "Month",
				type: "date",
			}],
			rows: []
		}
		var options = {
			isStacked: "true",
			fill: 20,
			displayExactValues: true,
			hAxis: {
				format: 'MMM-yy',
				gridlines: {
					"count": 15,
					color: 'transparent'
				}
			},
			seriesType: 'line',
			series: {},
			interpolateNulls: true,
			vAxes: {
				0: {
					title: "Average Income/Hr",
					format: '#',
					// gridlines: {
					// 	"count": 10
					// }
				}
			},
			legend: {
				position: 'top',
				maxLines: 5
			},
			lineWidth: 4,
			// width: 800,
			height: 400
		}

		var areas = [];
		for (var i in data['by_area']) {
			if (areas.indexOf(data['by_area'][i].area) == -1) {
				areas.push(data['by_area'][i].area);
				chart_data.cols.push({
					label: data['by_area'][i].area,
					type: "number"
				});
			}
		}

		// last 2 columns are average
		chart_data.cols.push({
			label: 'Average Income/Hr',
			type: 'number'
		})
		chart_data.cols.push({
			type: "number",
			role: "annotation",
			p: {
				role: "annotation"
			}
		});
		options['series'][chart_data.cols.length - 3] = {
			color: 'lightgray',
			type: 'bars',
			targetAxisIndex: 1
		}

		// fill cols with null
		var startDate = moment('2014/6/1', 'YYYY-MM-DD');
		var now = moment(last_fully_updated_month, 'MMM-YY');
		now.add(1, 'months');

		while (monthDiff(startDate, now) != 0) {
			var row = {
				c: [{
					v: new Date(startDate.format('YYYY-MM-DD'))
				}]
			}
			for (var i in areas) {
				row.c.push({
					v: null
				});
			}
			// the second col is average, put it as 0 first
			row.c.push({
				v: null
			});
			row.c.push({
				v: null
			});

			chart_data.rows.push(row);
			startDate.add(1, 'months');
		}

		// fill data
		for (var i in data['by_area']) {
			var col_index = areas.indexOf(data['by_area'][i].area) + 1;
			var row_index = monthDiff(moment('2014/6/1', 'YYYY-MM-DD'), moment(data['by_area'][i].month, "MMM-YY"));
			if (row_index >= chart_data.rows.length) {
				continue;
			}
			chart_data.rows[row_index].c[col_index].v = Math.round(data['by_area'][i].profit_per_hour);

		}

		for (var i in data['average']) {
			var col_index = chart_data.cols.length - 2;
			var row_index = monthDiff(moment('2014/6/1', 'YYYY-MM-DD'), moment(data['average'][i].month, "MMM-YY"));
			if (row_index >= chart_data.rows.length) {
				continue;
			}
			chart_data.rows[row_index].c[col_index].v = Math.round(data['average'][i].profit_per_hour);
			chart_data.rows[row_index].c[col_index + 1].v = Math.round(data['average'][i].profit_per_hour);

		}

		// draw!
		$scope.estimatedIPHForSULChartObject.data = chart_data;
		$scope.estimatedIPHForSULChartObject.options = options;
	});
}

/**
 * Draw monthly additional analysis charts
 */
function retriveAndDrawAdditionalCharts(params, title, last_fully_updated_month, $scope, $http) {
	// uplifter by area bar chart
	$http.get(appendParamsToUrl('../api/uplifter-by-area', params)).success(function(data) {
		// initialize options and data structure, bloom project overview

		var options = {
			isStacked: "true",
			fill: 20,
			displayExactValues: true,
			hAxis: {
				"format": 'MMM-yy',
				gridlines: {
					"count": 15,
					color: 'transparent'
				}
			},
			seriesType: 'bars',
			vAxis: {
				title: "Uplifters",
				format: '#',
				// gridlines: {
				// 	"count": 10
				// }
			},
			// width: 800,
			height: 450

		}

		timeseriersStackedColumnChart($scope, 'uplifterByAreaChartObject', options, data, last_fully_updated_month)
	});

	// stockpoint by area chart
	$http.get(appendParamsToUrl('../api/stockpoint-by-area', params)).success(function(data) {
		var options = {
			isStacked: "true",
			fill: 20,
			displayExactValues: true,
			hAxis: {
				"format": 'MMM-yy',
				gridlines: {
					"count": 15,
					color: 'transparent'
				}
			},
			seriesType: 'bars',
			vAxis: {
				title: "Stockpoints",
				format: '#',
				// gridlines: {
				// 	"count": 10
				// }
			},
			// width: 800,
			height: 450

		}
		timeseriersStackedColumnChart($scope, 'stockpointByAreaChartObject', options, data, last_fully_updated_month)
	});

	// estimated man hour
	$http.get(appendParamsToUrl('../api/estimated-man-hour', params)).success(function(data) {


		var options = {
			isStacked: "true",
			fill: 20,
			displayExactValues: true,
			hAxis: {
				"format": 'MMM-yy',
				gridlines: {
					"count": 15,
					color: 'transparent'
				}
			},
			seriesType: 'bars',
			vAxis: {
				title: "Estimated Uplifter Man Hours",
				format: '#',
				// gridlines: {
				// 	"count": 10
				// }
			},
			// width: 800,
			height: 450

		}

		timeseriersStackedColumnChart($scope, 'estimatedManHourByAreaChartObject', options, data, last_fully_updated_month)
	});


	// rsv sold
	$http.get(appendParamsToUrl('../api/rsv-sold', params)).success(function(data) {
		$scope.bisnuessContribChartObject = {
			type: "ComboChart",
			displayed: true,
			formatter: {}
		}

		var chart_data = {
			cols: [{
				id: "month",
				label: "Month",
				type: "date",
			}, {
				label: "Wrigley",
				type: "number",
			}, {
				label: "Mars",
				type: "number",
			}, {
				label: "Total RSV",
				type: "number",
			}, {
				label: "Wrigley RSV",
				type: "number",
			}, {
				label: "Mars RSV",
				type: "number",
			}],
			rows: []
		}
		var options = {
			isStacked: "true",
			fill: 20,
			displayExactValues: true,
			hAxis: {
				format: 'MMM-yy',
				gridlines: {
					"count": 15,
					color: 'transparent'
				}
			},
			seriesType: 'line',
			series: {
				0: {
					type: 'bars',
					targetAxisIndex: 0
				},
				1: {
					type: 'bars',
					targetAxisIndex: 0
				},
				2: {
					type: 'lines',
					targetAxisIndex: 1
				},
				3: {
					type: 'lines',
					targetAxisIndex: 1
				},
				4: {
					type: 'lines',
					targetAxisIndex: 1
				}
			},
			interpolateNulls: true,
			vAxes: {
				0: {
					title: "SKU('000)",
					format: '#,###',
					// gridlines: {
					// 	"count": 10
					// }
				},
				1: {
					title: "RSV(php'000)",
					format: '#,###',
					// gridlines: {
					// 	"count": 10
					// }
				}
			},
			// width: 800,
			lineWidth: 4,
			colors: [color.wrigley, color.mars, color.total, color.wrigleyline, color.marsline],
			height: 400
		}

		// fill cols with null
		var startDate = moment('2014/6/1', 'YYYY-MM-DD');
		var now = moment(last_fully_updated_month, 'MMM-YY');
		now.add(1, 'months');

		while (monthDiff(startDate, now) != 0) {
			var row = {
				c: [{
					v: new Date(startDate.format('YYYY-MM-DD'))
				}]
			}
			for (var i = 0; i < 5; i++) {

				row.c.push({
					v: 0
				});

			}

			chart_data.rows.push(row);
			startDate.add(1, 'months');
		}

		// fill data
		for (var i in data['sku']) {
			var col_index = (data['sku'][i].company == 'Wrigley' ? 1 : 2)
			var row_index = monthDiff(moment('2014/6/1', 'YYYY-MM-DD'), moment(data['sku'][i].month, "MMM-YY"));
			if (row_index >= chart_data.rows.length) {
				continue;
			}
			chart_data.rows[row_index].c[col_index].v = data['sku'][i].inner_bags_sum / 1000;

		}

		for (var i in data['rsv']) {
			var col_index = (data['rsv'][i].company == 'Wrigley' ? 4 : 5)
			var row_index = monthDiff(moment('2014/6/1', 'YYYY-MM-DD'), moment(data['rsv'][i].month, "MMM-YY"));
			if (row_index >= chart_data.rows.length) {
				continue;
			}
			chart_data.rows[row_index].c[col_index].v = Math.round(data['rsv'][i].rsv / 1000);
			// add to sum
			chart_data.rows[row_index].c[3].v += Math.round(data['rsv'][i].rsv / 1000);

		}

		// draw!
		$scope.bisnuessContribChartObject.data = chart_data;
		$scope.bisnuessContribChartObject.options = options;
	});

	// case sold
	$http.get(appendParamsToUrl('../api/case-sold', params)).success(function(data) {
		$scope.caseSoldChartObject = {
			type: "ComboChart",
			displayed: true,
			formatter: {}
		}

		var chart_data = {
			cols: [{
				id: "month",
				label: "Month",
				type: "date",
			}],
			rows: []
		}
		var options = {
			isStacked: "true",
			fill: 20,
			displayExactValues: true,
			hAxis: {
				format: 'MMM-yy',
				gridlines: {
					"count": 15,
					color: 'transparent'
				}
			},
			seriesType: 'bars',
			interpolateNulls: true,
			vAxes: {
				0: {
					title: "SKU Cases Sold",
					format: '#',
					// gridlines: {
					// 	"count": 10
					// }
				}
			},
			legend: {
				position: 'top',
				maxLines: 4
			},
			lineWidth: 4,
			colors: [color.dm50, color.jf50, color.sugus34, color.wrigleyothers, color.snickers20, color.mm14, color.marsline, color.wrigleyline],
			// width: 800,
			height: 400
		}

		// fetch cols 
		var products = ['DM 50+10', 'JF 50+10', 'Sugus 34', 'Wrigley Others', 'Snickers 20g', 'M&M 14.5g']
		var companies = ['Mars', 'Wrigley']
		for (var i in products) {
			chart_data.cols.push({
				label: products[i],
				type: "number"
			});

		}
		for (var i in companies) {
			chart_data.cols.push({
				label: companies[i],
				type: "number"
			});
		}
		// last two col for total
		chart_data.cols.push({
			type: "number"
		});
		chart_data.cols.push({
			type: "number",
			role: "annotation",
			p: {
				role: "annotation"
			}
		});

		// set companies to line chart
		options['series'] = {};
		options['series'][products.length] = {
			type: 'line',
			targetAxisIndex: 1
		}
		options['series'][products.length + 1] = {
			type: 'line',
			targetAxisIndex: 1
		}

		// fill cols with 0
		var startDate = moment('2014/6/1', 'YYYY-MM-DD');
		var now = moment(last_fully_updated_month, 'MMM-YY');
		now.add(1, 'months');
		var data_array = [];
		while (monthDiff(startDate, now) != 0) {
			var row = {
				c: [{
					v: new Date(startDate.format('YYYY-MM-DD'))
				}]
			}
			for (var i in products) {
				row.c.push({
					v: 0
				});
			}
			for (var i in companies) {
				row.c.push({
					v: 0
				});
			}
			// for total
			row.c.push({
				v: 0
			});
			row.c.push({
				v: 0
			});
			chart_data.rows.push(row);
			startDate.add(1, 'months');
		}

		options.series[chart_data.cols.length - 3] = {
			type: 'line',
			color: 'grey',
			lineWidth: 0,
			pointSize: 0,
			visibleInLegend: false
		}

		// fill data
		for (var i in data['by_product']) {
			var row_index = monthDiff(moment('2014/6/1', 'YYYY-MM-DD'), moment(data['by_product'][i].month, "MMM-YY"));
			if (row_index >= chart_data.rows.length) {
				continue;
			}
			if (products.indexOf(data['by_product'][i].product) != -1) {
				var col_index = products.indexOf(data['by_product'][i].product) + 1;

				chart_data.rows[row_index].c[col_index].v = data['by_product'][i].qty_sum;
			} else {
				var col_index = products.indexOf('Wrigley Others') + 1


				chart_data.rows[row_index].c[col_index].v += data['by_product'][i].qty_sum;
			}

			// add to total
			chart_data.rows[row_index].c[chart_data.cols.length - 1].v += data['by_product'][i].qty_sum;
			chart_data.rows[row_index].c[chart_data.cols.length - 2].v += data['by_product'][i].qty_sum;
		}

		for (var i in data['by_company']) {
			var col_index = companies.indexOf(data['by_company'][i].company) + products.length + 1;
			var row_index = monthDiff(moment('2014/6/1', 'YYYY-MM-DD'), moment(data['by_company'][i].month, "MMM-YY"));
			if (row_index >= chart_data.rows.length) {
				continue;
			}
			chart_data.rows[row_index].c[col_index].v = data['by_company'][i].qty_sum;
		}
		// draw chart!
		$scope.caseSoldChartObject.data = chart_data;
		$scope.caseSoldChartObject.options = options;
	});

	// case sold by area
	$http.get(appendParamsToUrl('../api/case-sold-by-area', params)).success(function(data) {
		// initialize options and data structure, bloom project overview
		var options = {
			isStacked: "true",
			fill: 20,
			displayExactValues: true,
			hAxis: {
				"format": 'MMM-yy',
				gridlines: {
					"count": 15,
					color: 'transparent'
				}
			},
			seriesType: 'bars',
			vAxis: {
				title: "SKU Cases Sold",
				format: '#',
				// gridlines: {
				// 	"count": 10
				// }
			},
			// width: 800,
			height: 450
		}
		timeseriersStackedColumnChart($scope, 'caseSoldByAreaChartObject', options, data, last_fully_updated_month)
	});


}

/**
 * Draw Shareout charts
 */
function retriveAndDrawShareoutCharts($scope, $http, last_fully_updated_month) {
	// get 3 month range according to selected month, 2 months back
	var months = get_last_three_month($scope.selected_month);
	// get previous month
	$scope.previous_month = months[1];

	// build params from scope variable
	var params = {
		area: $scope.selected_area,
		month: $scope.selected_month
	}

	// area overview chart, only area is needed
	$http.get(appendParamsToUrl('../api/overview', {
		area: params.area
	})).success(function(data) {
		//parse ajax data to data array
		var startDate = moment('2014/6/1', 'YYYY-MM-DD');
		var now = moment(last_fully_updated_month, 'MMM-YY');
		now.add(1, 'months');
		var data_array = [];
		while (monthDiff(startDate, now) != 0) {
			data_array.push(
				[new Date(startDate.format('YYYY-MM-DD')) //0 months
					, 0 //1 total stable ul
					, 0 //2 new ul
					, 0 //3 dropped ul
					, 0 //4 stable sp
					, 0 //5 new sp
					, 0 //6 dropped sp
					, 0 //7 total stable ul without lp4y
					, 0 //8 new ul without lp4y
					, 0 //9 dropped ul without lp4y
				]
			);

			startDate.add(1, 'months');
		}

		// parse data from ajax for first chart, all original
		for (var i in data['ul_overview']) {
			var month = moment(data['ul_overview'][i]['month'], "MMM-YY");
			var startDate = moment('2014/6/1', 'YYYY-MM-DD');
			var index = monthDiff(startDate, month);
			if (index >= data_array.length) {
				continue;
			}
			if (data['ul_overview'][i]['status'] == 'S' || data['ul_overview'][i]['status'] == 'S1' || data['ul_overview'][i]['status'] == 'S2') {
				data_array[index][1] += data['ul_overview'][i]['count']

			} else if (data['ul_overview'][i]['status'] == 'N') {
				data_array[index][2] = data['ul_overview'][i]['count']
			} else if (data['ul_overview'][i]['status'] == 'D') {
				data_array[index][3] = data['ul_overview'][i]['count']
			}
		}

		for (var i in data['sp_overview']) {
			var month = moment(data['sp_overview'][i]['month'], "MMM-YY");
			var startDate = moment('2014/6/1', 'YYYY-MM-DD');
			var index = monthDiff(startDate, month);
			if (index >= data_array.length) {
				continue;
			}
			if (data['sp_overview'][i]['status'] == 'S') {
				data_array[index][4] = data['sp_overview'][i]['count']
			} else if (data['sp_overview'][i]['status'] == 'N') {
				data_array[index][5] = data['sp_overview'][i]['count']
			} else if (data['sp_overview'][i]['status'] == 'D') {
				data_array[index][6] = data['sp_overview'][i]['count']
			}
		}

		for (var i in data['ul_without_lp4y_overview']) {
			var month = moment(data['ul_without_lp4y_overview'][i]['month'], "MMM-YY");
			var startDate = moment('2014/6/1', 'YYYY-MM-DD');
			var index = monthDiff(startDate, month);
			if (index >= data_array.length) {
				continue;
			}
			if (data['ul_without_lp4y_overview'][i]['status'] == 'S') {
				data_array[index][7] = data['ul_without_lp4y_overview'][i]['count']
			} else if (data['ul_without_lp4y_overview'][i]['status'] == 'N') {
				data_array[index][8] = data['ul_without_lp4y_overview'][i]['count']
			} else if (data['ul_without_lp4y_overview'][i]['status'] == 'D') {
				data_array[index][9] = data['ul_without_lp4y_overview'][i]['count']
			}
		}


		// initialize options and data structure, bloom project overview
		$scope.overviewChartObject = {
			type: "ColumnChart",
			displayed: true,
			formatter: {}
		}
		var options = {
			isStacked: "true",
			fill: 20,
			displayExactValues: true,
			hAxis: {
				"format": 'MMM-yy',
				gridlines: {
					"count": 15,
					color: 'transparent'
				}
			},
			seriesType: 'bars',
			vAxis: {
				title: "Entrepreneurs",
				format: '#',
				// gridlines: {
				// 	"count": 10
				// }
			},
			series: {
				4: {
					type: 'line',
					color: 'grey',
					lineWidth: 0,
					pointSize: 0,
					visibleInLegend: false
				}
			},
			lineWidth: 4,
			colors: [color.stable_ul, color.new_ul, color.stable_sp, color.new_sp],
			// width: 800,
			height: 450

		}
		var chart_data = {
			cols: [{
				id: "month",
				label: "Month",
				type: "date",
				p: {}
			}, {
				id: "total-stable-ul-id",
				label: "Total Stable UL",
				type: "number",
				p: {}
			}, {
				id: "new-ul-id",
				label: "New UL",
				type: "number",
				p: {}
			}, {
				id: "stable-sp-id",
				label: "Stable SP",
				type: "number",
				p: {}
			}, {
				id: "new-sp-id",
				label: "New SP",
				type: "number"
			}, {
				type: "number"
			}, {
				type: "number",
				role: "annotation",
				p: {
					role: "annotation"
				}

			}],
			rows: []
		}


		for (var i in data_array) {
			chart_data.rows.push({
				c: [{
					v: data_array[i][0]
				}, {
					v: data_array[i][1]
				}, {
					v: data_array[i][2]
				}, {
					v: data_array[i][4]
				}, {
					v: data_array[i][5]
				}, {
					v: data_array[i][1] + data_array[i][2] + data_array[i][4] + data_array[i][5]
				}, {
					v: data_array[i][1] + data_array[i][2] + data_array[i][4] + data_array[i][5]
				}]
			})
		}


		// update scope variable for first chart
		$scope.overviewChartObject.data = chart_data;
		$scope.overviewChartObject.options = options;
	});

	// given an area, draw charts that show the 3 months purchase value for sp under this area
	$http.get(appendParamsToUrl('../api/shareout/sp-three-month-purchase-value', params)).success(function(data) {

		var stockpoints = [];
		// initialize chart object
		$scope.threeMonthPurchaseValueChartObject = {
			type: "ComboChart",
			displayed: true,
			formatter: {}
		}

		var chart_data = {
			cols: [{
				id: "sp_name",
				label: "Stockpoints",
				type: "string",
			}],
			rows: []
		}
		for (var i in months) {
			chart_data.cols.push({
				label: months[i],
				type: "number"
			})
			chart_data.cols.push({
				type: "number",
				role: "annotation",
				p: {
					role: "annotation"
				}
			})
		}

		var options = {
			fill: 20,
			displayExactValues: true,
			seriesType: 'bars',
			interpolateNulls: true,
			vAxes: {
				0: {
					title: "Purchase Value (Php' 1000)",
					format: '#',
					// gridlines: {
					// 	"count": 10
					// }
				}
			},
			legend: {
				position: 'top',
				maxLines: 4
			},
			lineWidth: 4,
			// width: 800,
			height: 400
		}

		// fill rows with data
		for (var i in data) {
			var row_index = stockpoints.indexOf(data[i].stockpoint_name)
			if (row_index != -1) {
				// row for this sp exist, add the purchase value to its row
				var col_index = months.indexOf(data[i].month) * 2 + 1;
				chart_data.rows[row_index].c[col_index].v = Math.round(data[i].value_purchase / 1000);
				chart_data.rows[row_index].c[col_index + 1].v = Math.round(data[i].value_purchase / 1000);
			} else {
				// row for this stockpoint does not exist, add row first
				stockpoints.push(data[i].stockpoint_name);
				var row = {
						c: [{
							v: data[i].stockpoint_name
						}]
					}
					//push 6 empty col data since we have 3 month, each month, 1 for column 1 for annotation
				for (var j = 0; j < 6; j++) {
					row.c.push({
						v: null
					});
				}
				chart_data.rows.push(row)

				// fill the data for the newly added row
				row_index = stockpoints.length - 1;
				var col_index = months.indexOf(data[i].month) * 2 + 1;
				chart_data.rows[row_index].c[col_index].v = Math.round(data[i].value_purchase / 1000);
				chart_data.rows[row_index].c[col_index + 1].v = Math.round(data[i].value_purchase / 1000);
			}
		}

		//draw charts
		$scope.threeMonthPurchaseValueChartObject.data = chart_data;
		$scope.threeMonthPurchaseValueChartObject.options = options;
	});

	// given an area, draw charts that show the 3 months income for sp under this area
	$http.get(appendParamsToUrl('../api/shareout/sp-three-month-income', params)).success(function(data) {
		var stockpoints = [];
		// initialize chart object
		$scope.threeMonthSPIncomeChartObject = {
			type: "ComboChart",
			displayed: true,
			formatter: {}
		}

		var chart_data = {
			cols: [{
				id: "sp_name",
				label: "Stockpoints",
				type: "string",
			}],
			rows: []
		}
		for (var i in months) {
			chart_data.cols.push({
				label: months[i],
				type: "number"
			})
			chart_data.cols.push({
				type: "number",
				role: "annotation",
				p: {
					role: "annotation"
				}
			})
		}

		var options = {
			fill: 20,
			displayExactValues: true,
			seriesType: 'bars',
			interpolateNulls: true,
			vAxes: {
				0: {
					title: "Income (Php' 1000)",
					format: '#',
					// gridlines: {
					// 	"count": 10
					// }
				}
			},
			legend: {
				position: 'top',
				maxLines: 4
			},
			lineWidth: 4,
			// width: 800,
			height: 400
		}

		// fill rows with data
		for (var i in data) {
			var row_index = stockpoints.indexOf(data[i].stockpoint_name)
			if (row_index != -1) {
				// row for this sp exist, add the purchase value to its row
				var col_index = months.indexOf(data[i].month) * 2 + 1;
				chart_data.rows[row_index].c[col_index].v = Math.round(data[i].profit / 1000);
				chart_data.rows[row_index].c[col_index + 1].v = Math.round(data[i].profit / 1000);
			} else {
				// row for this stockpoint does not exist, add row first
				stockpoints.push(data[i].stockpoint_name);
				var row = {
						c: [{
							v: data[i].stockpoint_name
						}]
					}
					//push 6 empty col data since we have 3 month, each month, 1 for column 1 for annotation
				for (var j = 0; j < 6; j++) {
					row.c.push({
						v: null
					});
				}
				chart_data.rows.push(row)

				// fill the data for the newly added row
				row_index = stockpoints.length - 1;
				var col_index = months.indexOf(data[i].month) * 2 + 1;
				chart_data.rows[row_index].c[col_index].v = Math.round(data[i].profit / 1000);
				chart_data.rows[row_index].c[col_index + 1].v = Math.round(data[i].profit / 1000);
			}
		}

		//draw charts
		$scope.threeMonthSPIncomeChartObject.data = chart_data;
		$scope.threeMonthSPIncomeChartObject.options = options;
	});

	// given an area and month , draw charts that show income and man-hours for ul under this area and month
	$http.get(appendParamsToUrl('../api/shareout/ul-income-and-man-hour', params)).success(function(data) {
		var uplifters = [];
		// initialize chart object
		$scope.ulIncomeAndEMHObject = {
			type: "ComboChart",
			displayed: true,
			formatter: {}
		}

		var chart_data = {
			cols: [{
				id: "ul_name",
				label: "Uplifters",
				type: "string",
			}, {
				id: "income",
				label: "Income",
				type: "number",
			}, {
				type: "number",
				role: "annotation",
				p: {
					role: "annotation"
				}
			}, {
				id: "man_hour",
				label: "Man-hour",
				type: "number",
			}, {
				type: "number",
				role: "annotation",
				p: {
					role: "annotation"
				}
			}],
			rows: []
		}


		var options = {
			fill: 20,
			displayExactValues: true,
			seriesType: 'bars',
			interpolateNulls: true,
			series: {
				1: {
					type: 'line',
					targetAxisIndex: 1
				},
			},
			vAxes: {
				0: {
					title: "Income",
					format: '#',
					// gridlines: {
					// 	"count": 10
					// }
				},
				1: {
					title: "Man-hour",
					format: '#',
					// gridlines: {
					// 	"count": 10
					// }
				}
			},
			hAxis: {
				// textStyle: {
				// 	fontSize: 8
				// }
			},
			legend: {
				position: 'top',
				maxLines: 4
			},
			lineWidth: 4,
			// width: 800,
			height: 400
		}

		// fill rows with data
		var fill_data = function(data, col_index, col_name, doDivide) {
			for (var i in data) {
				var row_index = uplifters.indexOf(data[i].uplifter_name)
				var value = doDivide ? Math.round(data[i][col_name] / 1000) : Math.round(data[i][col_name])
				if (row_index != -1) {
					// row for this sp exist, add the purchase value to its row
					chart_data.rows[row_index].c[col_index].v = value;
					chart_data.rows[row_index].c[col_index + 1].v = value;
				} else {
					// row for this stockpoint does not exist, add row first
					uplifters.push(data[i].uplifter_name);
					var row = {
							c: [{
								v: data[i].uplifter_name
							}]
						}
						//push 4 empty col data since we have income and man-hour, each have 1 for column 1 for annotation
					for (var j = 0; j < 4; j++) {
						row.c.push({
							v: null
						});
					}
					chart_data.rows.push(row)

					// fill the data for the newly added row
					row_index = uplifters.length - 1;
					chart_data.rows[row_index].c[col_index].v = value;
					chart_data.rows[row_index].c[col_index + 1].v = value;
				}
			}
		}
		fill_data(data.income, 1, 'profit', false);
		fill_data(data.man_hour, 3, 'man_hour_sum', false);



		//draw charts
		$scope.ulIncomeAndEMHObject.data = chart_data;
		$scope.ulIncomeAndEMHObject.options = options;
	});

	// given an area and month , draw charts that show the days worked for this month, and improvement compared to previous month
	$http.get(appendParamsToUrl('../api/shareout/most-improved-days-worked', params)).success(function(data) {
		var uplifters = [];
		// initialize chart object
		$scope.improvedChartObject = {
			type: "ComboChart",
			displayed: true,
			formatter: {}
		}

		var chart_data = {
			cols: [{
				id: "ul_name",
				label: "Uplifters",
				type: "string",
			}, {
				id: "this_month",
				label: months[2],
				type: "number",
			}, {
				type: "number",
				role: "annotation",
				p: {
					role: "annotation"
				}
			}, {
				id: "difference",
				label: "Difference",
				type: "number",
			}, {
				type: "number",
				role: "annotation",
				p: {
					role: "annotation"
				}
			}],
			rows: []
		}


		var options = {
			fill: 20,
			displayExactValues: true,
			seriesType: 'bars',
			interpolateNulls: true,
			vAxes: {
				0: {
					title: "Days Worked",
					format: '#',
					// gridlines: {
					// 	"count": 10
					// }
				}
			},
			hAxis: {
				// textStyle: {
				// 	fontSize: 7
				// }
			},
			legend: {
				position: 'top',
				maxLines: 4
			},
			lineWidth: 4,
			// width: 800,
			height: 400
		}

		// fill rows with data
		var fill_data = function(data, col_name) {
			for (var i in data) {
				var row_index = uplifters.indexOf(data[i].uplifter_name)
				var col_index = 0;
				// if the month of this data is this month
				if (data[i].month == months[2]) {
					col_index = 1;
				} else {
					col_index = 3;
				}
				// round the value
				var value = Math.round(data[i][col_name])
				if (row_index != -1) {
					// row for this ul exist, add the days worked to its row
					chart_data.rows[row_index].c[col_index].v = value;
					chart_data.rows[row_index].c[col_index + 1].v = value;
				} else {
					// row for this ul does not exist, add row first
					uplifters.push(data[i].uplifter_name);
					var row = {
							c: [{
								v: data[i].uplifter_name
							}]
						}
						//push 4 empty col data since we have income and man-hour, each have 1 for column 1 for annotation
					for (var j = 0; j < 4; j++) {
						row.c.push({
							v: 0
						});
					}
					chart_data.rows.push(row)

					// fill the data for the newly added row
					row_index = uplifters.length - 1;
					chart_data.rows[row_index].c[col_index].v = value;
					chart_data.rows[row_index].c[col_index + 1].v = value;
				}
			}
			// convert the premonth value to difference by minus this month value
			for (var i in chart_data.rows) {
				chart_data.rows[i].c[3].v = chart_data.rows[i].c[1].v - chart_data.rows[i].c[3].v;
				chart_data.rows[i].c[4].v = chart_data.rows[i].c[2].v - chart_data.rows[i].c[4].v;
			}
		}
		fill_data(data, 'count');

		//draw charts
		$scope.improvedChartObject.data = chart_data;
		$scope.improvedChartObject.options = options;
	});
}

/**
 * Draw stockpoint product sold detail chart
 */
function retriveAndDrawShareoutSPProductChart($scope, $http, last_fully_updated_month) {
	// get 3 month range according to selected month, 2 months back
	var months = get_last_three_month($scope.selected_month);

	// given a sp name, draw charts that show the qty of each product deliveried to this sp per month
	// use special param stockpoint
	var sp = $scope.selected_sp_name;
	var params = {
		stockpoint_name: sp,
		month: $scope.selected_month
	}
	$http.get(appendParamsToUrl('../api/shareout/product-sold-detail', params)).success(function(data) {
		var products = [];

		// initialize chart object
		$scope.spProductDetailChartObject = {
			type: "ComboChart",
			displayed: true,
			formatter: {}
		}

		var chart_data = {
			cols: [{
				id: "product",
				label: "Product",
				type: "string",
			}],
			rows: []
		}
		for (var i in months) {
			chart_data.cols.push({
				label: months[i],
				type: "number"
			})
			chart_data.cols.push({
				type: "number",
				role: "annotation",
				p: {
					role: "annotation"
				}
			})
		}

		var options = {
			fill: 20,
			displayExactValues: true,
			seriesType: 'bars',
			interpolateNulls: true,
			vAxes: {
				0: {
					title: "QTY",
					format: '#',
					// gridlines: {
					// 	"count": 10
					// }
				}
			},
			legend: {
				position: 'top',
				maxLines: 4
			},
			lineWidth: 4,
			// width: 800,
			height: 400
		}

		// fill rows with data's product detail
		for (var i in data.product) {
			var row_index = products.indexOf(data.product[i].product)
			if (row_index != -1) {
				// row for this product exist, add the sum to its row
				var col_index = months.indexOf(data.product[i].month) * 2 + 1;
				chart_data.rows[row_index].c[col_index].v = Math.round(data.product[i].sum);
				chart_data.rows[row_index].c[col_index + 1].v = Math.round(data.product[i].sum);
			} else {
				// row for this product does not exist, add row first
				products.push(data.product[i].product);
				var row = {
						c: [{
							v: data.product[i].product
						}]
					}
					//push 6 empty col data since we have 3 month, each month, 1 for column 1 for annotation
				for (var j = 0; j < 6; j++) {
					row.c.push({
						v: null
					});
				}
				chart_data.rows.push(row)

				// fill the data for the newly added row
				row_index = products.length - 1;
				var col_index = months.indexOf(data.product[i].month) * 2 + 1;
				chart_data.rows[row_index].c[col_index].v = Math.round(data.product[i].sum);
				chart_data.rows[row_index].c[col_index + 1].v = Math.round(data.product[i].sum);
			}
		}
		// then fill rows with ul count
		var row = {
				c: [{
					v: "Total UL"
				}]
			}
			//push 6 empty col data since we have 3 month, each month, 1 for column 1 for annotation
		for (var j = 0; j < 6; j++) {
			row.c.push({
				v: null
			});
		}
		for (var i in data.ul_count) {
			var col_index = months.indexOf(data.ul_count[i].month) * 2 + 1;
			row.c[col_index].v = row.c[col_index + 1].v = data.ul_count[i].sum;

		}
		// push the last row to the chart object
		chart_data.rows.push(row)

		// draw the chart!
		$scope.spProductDetailChartObject.data = chart_data;
		$scope.spProductDetailChartObject.options = options;
	});
}

/**
 * Draw Quaterly charts
 */
function retriveAndDrawQuaterlyCharts($scope, $http) {}

/**
 * Draw Recruitment MTD Charts
 */
function retriveAndDrawRecruitmentMTDCharts(params, title, $scope, $http) {
	// mtd recruitment chart
	$http.get(appendParamsToUrl('../api/overview', params)).success(function(data) {
		//parse ajax data to data array
		var startDate = moment('2014/6/1', 'YYYY-MM-DD');
		var now = moment();
		now.add(1, 'months');
		var data_array = [];
		while (monthDiff(startDate, now) != 0) {
			data_array.push(
				[new Date(startDate.format('YYYY-MM-DD')) //0 months
					, 0 //1 total stable ul
					, 0 //2 new ul
					, 0 //3 dropped ul
					, 0 //4 stable sp
					, 0 //5 new sp
					, 0 //6 dropped sp
					, 0 //7 total stable ul without lp4y
					, 0 //8 new ul without lp4y
					, 0 //9 dropped ul without lp4y
				]
			);

			startDate.add(1, 'months');
		}

		// parse data from ajax for first chart, all original
		for (var i in data['ul_overview']) {
			var month = moment(data['ul_overview'][i]['month'], "MMM-YY");
			var startDate = moment('2014/6/1', 'YYYY-MM-DD');
			var index = monthDiff(startDate, month);
			if (index >= data_array.length) {
				continue;
			}
			if (data['ul_overview'][i]['status'] == 'S' || data['ul_overview'][i]['status'] == 'S1' || data['ul_overview'][i]['status'] == 'S2') {
				data_array[index][1] += data['ul_overview'][i]['count']

			} else if (data['ul_overview'][i]['status'] == 'N') {
				data_array[index][2] = data['ul_overview'][i]['count']
			} else if (data['ul_overview'][i]['status'] == 'D') {
				data_array[index][3] = data['ul_overview'][i]['count']
			}
		}

		for (var i in data['sp_overview']) {
			var month = moment(data['sp_overview'][i]['month'], "MMM-YY");
			var startDate = moment('2014/6/1', 'YYYY-MM-DD');
			var index = monthDiff(startDate, month);
			if (index >= data_array.length) {
				continue;
			}
			if (data['sp_overview'][i]['status'] == 'S') {
				data_array[index][4] = data['sp_overview'][i]['count']
			} else if (data['sp_overview'][i]['status'] == 'N') {
				data_array[index][5] = data['sp_overview'][i]['count']
			} else if (data['sp_overview'][i]['status'] == 'D') {
				data_array[index][6] = data['sp_overview'][i]['count']
			}
		}

		for (var i in data['ul_without_lp4y_overview']) {
			var month = moment(data['ul_without_lp4y_overview'][i]['month'], "MMM-YY");
			var startDate = moment('2014/6/1', 'YYYY-MM-DD');
			var index = monthDiff(startDate, month);
			if (index >= data_array.length) {
				continue;
			}
			if (data['ul_without_lp4y_overview'][i]['status'] == 'S') {
				data_array[index][7] = data['ul_without_lp4y_overview'][i]['count']
			} else if (data['ul_without_lp4y_overview'][i]['status'] == 'N') {
				data_array[index][8] = data['ul_without_lp4y_overview'][i]['count']
			} else if (data['ul_without_lp4y_overview'][i]['status'] == 'D') {
				data_array[index][9] = data['ul_without_lp4y_overview'][i]['count']
			}
		}


		// initialize options and data structure, bloom project overview
		$scope.overviewChartObject = {
			type: "ColumnChart",
			displayed: true,
			formatter: {}
		}
		var options = {
			isStacked: "true",
			fill: 20,
			displayExactValues: true,
			hAxis: {
				"format": 'MMM-yy',
				gridlines: {
					"count": 15,
					color: 'transparent'
				}
			},
			seriesType: 'bars',
			vAxis: {
				title: "Entrepreneurs",
				format: '#',
				// gridlines: {
				// 	"count": 10
				// }
			},
			series: {
				4: {
					type: 'line',
					color: 'grey',
					lineWidth: 0,
					pointSize: 0,
					visibleInLegend: false
				}
			},
			lineWidth: 4,
			colors: [color.stable_ul, color.new_ul, color.stable_sp, color.new_sp],
			// width: 800,
			height: 450

		}
		var chart_data = {
			cols: [{
				id: "month",
				label: "Month",
				type: "date",
				p: {}
			}, {
				id: "total-stable-ul-id",
				label: "Total Stable UL",
				type: "number",
				p: {}
			}, {
				id: "new-ul-id",
				label: "New UL",
				type: "number",
				p: {}
			}, {
				id: "stable-sp-id",
				label: "Stable SP",
				type: "number",
				p: {}
			}, {
				id: "new-sp-id",
				label: "New SP",
				type: "number"
			}, {
				type: "number"
			}, {
				type: "number",
				role: "annotation",
				p: {
					role: "annotation"
				}

			}],
			rows: []
		}


		for (var i in data_array) {
			chart_data.rows.push({
				c: [{
					v: data_array[i][0]
				}, {
					v: data_array[i][1]
				}, {
					v: data_array[i][2]
				}, {
					v: data_array[i][4]
				}, {
					v: data_array[i][5]
				}, {
					v: data_array[i][1] + data_array[i][2] + data_array[i][4] + data_array[i][5]
				}, {
					v: data_array[i][1] + data_array[i][2] + data_array[i][4] + data_array[i][5]
				}]
			})
		}


		// update scope variable for first chart
		$scope.overviewChartObject.data = chart_data;
		$scope.overviewChartObject.options = options;
	});

	// http get for ul and sp potential (comcare)
	$http.get(appendParamsToUrl('../api/target', params)).success(function(data) {
		// initialize data for uplifter tenure
		$scope.ulOverviewChartObject = {
			type: "ComboChart",
			displayed: true,
			formatter: {},
			options: {
				isStacked: "true",
				seriesType: 'bars',
				height: 400,
				colors: [color.stable_active_ul, color.stable_inactive_ul, color.drop, color.new_ul, color.prescreened, color.stable_active_ul],
				legend: {
					position: "top",
					maxLines: 4
				}
			}
		}

		$scope.spOverviewChartObject = {
			type: "ComboChart",
			displayed: true,
			formatter: {},
			options: {
				isStacked: "true",
				seriesType: 'bars',
				height: 400,
				colors: [color.stable_sp, color.drop, color.new_sp, color.prescreened, color.stable_sp],
				legend: {
					position: "top",
					maxLines: 4
				}
			}
		}

		// build chart data
		var ul_chart_data = {
			cols: [{
				id: "month",
				label: "Month",
				type: "string",
				p: {}
			}, {
				id: "stable-active-ul-id",
				label: "Stable UL - Active",
				type: "number",
				p: {}
			}, {
				id: "stable-inactive-ul-id",
				label: "Stable UL - InActive",
				type: "number",
				p: {}
			}, {
				id: "dropped-ul-id",
				label: "Dropped UL",
				type: "number",
				p: {}
			}, {
				id: "new-ul-id",
				label: "New UL",
				type: "number",
				p: {}
			}, {
				id: "prescreened-ul-id",
				label: "UL candidate - Prescreened",
				type: "number",
				p: {}
			}, {
				id: "target-ul-id",
				label: "Target",
				type: "number",
				p: {}
			}],
			rows: [{
				c: [{
					v: "Last Month"
				}, {
					v: 0
				}, {
					v: 0
				}, {
					v: 0
				}, {
					v: 0
				}, {
					v: data.ul.last_month_potential[0].count
				}, {
					v: 0
				}]
			}, {
				c: [{
					v: "Month To Date"
				}, {
					v: 0
				}, {
					v: 0
				}, {
					v: 0
				}, {
					v: 0
				}, {
					v: data.ul.this_month_potential[0].count
				}, {
					v: 0
				}]
			}, {
				c: [{
					v: "Target this month"
				}, {
					v: 0
				}, {
					v: 0
				}, {
					v: 0
				}, {
					v: 0
				}, {
					v: 0
				}, {
					v: data.ul.target[0].target
				}]
			}]
		}

		var sp_chart_data = {
			cols: [{
				id: "month",
				label: "Month",
				type: "string",
				p: {}
			}, {
				id: "stable-sp-id",
				label: "Stable SP",
				type: "number",
				p: {}
			}, {
				id: "dropped-sp-id",
				label: "Dropped SP",
				type: "number",
				p: {}
			}, {
				id: "new-sp-id",
				label: "New SP",
				type: "number",
				p: {}
			}, {
				id: "prescreened-sp-id",
				label: "SP candidate - Prescreened",
				type: "number",
				p: {}
			}, {
				id: "target-sp-id",
				label: "Target",
				type: "number",
				p: {}
			}],
			rows: [{
				c: [{
					v: "Last Month"
				}, {
					v: 0
				}, {
					v: 0
				}, {
					v: 0
				}, {
					v: data.sp.last_month_potential[0].count
				}, {
					v: 0
				}]
			}, {
				c: [{
					v: "Month To Date"
				}, {
					v: 0
				}, {
					v: 0
				}, {
					v: 0
				}, {
					v: data.sp.this_month_potential[0].count
				}, {
					v: 0
				}]
			}, {
				c: [{
					v: "Target this month"
				}, {
					v: 0
				}, {
					v: 0
				}, {
					v: 0
				}, {
					v: 0
				}, {
					v: data.sp.target[0].target
				}]
			}]
		}

		// consolidate data for last month ul
		for (var i in data.ul.last_month) {
			var ob = data.ul.last_month[i];
			if (ob.status == 'D') {
				ul_chart_data.rows[0].c[3].v -= ob.count
			} else if (ob.status == 'S') {
				ul_chart_data.rows[0].c[1].v += ob.count
			} else if (ob.status == 'S1' || ob.status == 'S2') {
				ul_chart_data.rows[0].c[2].v += ob.count
			} else if (ob.status == 'N') {
				ul_chart_data.rows[0].c[4].v += ob.count
			}
		}
		for (var i in data.ul.this_month) {
			var ob = data.ul.this_month[i];
			if (ob.status == 'D') {
				ul_chart_data.rows[1].c[3].v -= ob.count
			} else if (ob.status == 'S') {
				ul_chart_data.rows[1].c[1].v += ob.count
			} else if (ob.status == 'S1' || ob.status == 'S2') {
				ul_chart_data.rows[1].c[2].v += ob.count
			} else if (ob.status == 'N') {
				ul_chart_data.rows[1].c[4].v += ob.count
			}
		}

		// consolidate data for this month
		for (var i in data.sp.last_month) {
			var ob = data.sp.last_month[i]
			if (ob.status == 'D') {
				// sp_chart_data.rows[0].c[2].v -= ob.count
			} else if (ob.status == 'S') {
				sp_chart_data.rows[0].c[1].v += ob.count
			} else if (ob.status == 'N') {
				sp_chart_data.rows[0].c[3].v += ob.count
			}
		}
		for (var i in data.sp.this_month) {
			var ob = data.sp.this_month[i]
			if (ob.status == 'D') {
				// sp_chart_data.rows[1].c[2].v -= ob.count
			} else if (ob.status == 'S') {
				sp_chart_data.rows[1].c[1].v += ob.count
			} else if (ob.status == 'N') {
				sp_chart_data.rows[1].c[3].v += ob.count
			}
		}

		// draw charts
		$scope.ulOverviewChartObject.data = ul_chart_data;
		$scope.spOverviewChartObject.data = sp_chart_data
	});
}

/**
 * Helper function to check is the string is a validate date
 */
function isDate(date) {
	return ((new Date(date) !== "Invalid Date" && !isNaN(new Date(date))));
}

/**
 * Helper function to parse header for display
 */

function parseHeader(header, option) {
	if (!isDate(header)) {
		var words = header.split("_");
		var result = "";

		for (var i in words) {
			result += " " + capitalizeFirstLetter(words[i]);
		}
		return result.trim();
	} else {
		var start = moment(header);

		if (option == "weekly") {
			var end = moment(header);
			end.add(6, 'days');
			return start.format('YYYY/MM/DD') + " To " + end.format('YYYY/MM/DD');
		} else if (option == "monthly") {
			return start.format('MMM-YY')
		}
	}
}

/**
 * Helper function to capitalize first letter
 * @param  {String} string input word
 * @return {String}        capitalized word
 */
function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * helper function to calculate month difference, using moment
 */

function monthDiff(d1, d2) {
	var months;
	months = (d2.year() - d1.year()) * 12;
	months -= d1.month();
	months += d2.month();
	return months <= 0 ? 0 : months;
}

/**
 * initialize the dashboard tabs
 */
function initializeTab($http, $scope, tab, last_fully_updated_month, tabSelectListener, postRender) {
	var url = '../api/fo-area';
	$('#bloom-overview').tab('show');
	$http.get(url).success(function(data) {
		var fo = {}
		for (var i in data) {
			if (fo[data[i].fo_name] == undefined) {
				fo[data[i].fo_name] = [];
			}
			fo[data[i].fo_name].push(data[i].area)

		}
		$scope.fo = fo;

	});

	// add listener after ng-repeat finish render the tabs
	$scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
		$('.fo-area-selection').unbind()
		$('.fo-area-selection').each(
			function() {
				$(this).click(
					tabSelectListener
				)
			}
		);
		// optional post render call back function
		if (typeof postRender !== "undefined") {
			postRender();
		}
	});


}

/**
 * initialize the area selection drop down
 */
function initializeAreaMonthSelection($http, $scope, last_fully_updated_month) {
	// retrive full area list
	$http.get('../api/all-areas').success(function(data) {
		$scope.areas = data;
	});
	// retrive full stockpoint list
	$http.get('../api/stockpoints').success(function(data) {
		$scope.stockpoints = data;
	});
	// add listener after ng-repeat finish render the area list
	$scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent, attr) {
		if (attr.onFinishRender == "areaListFinished") {
			$('.area-selection').each(
				function() {
					$(this).click(
						areaSelectionListener
					)
				}
			);

			// use the default value to draw the shareout charts
			$scope.selected_month = last_fully_updated_month;
			$scope.selected_area = $('.area-selection')[0].innerHTML;
		} else if (attr.onFinishRender == "spSelectionListFinished") {
			$('.sp-selection').each(
				function() {
					$(this).click(
						spSelectionListener
					)
				}
			);

			// use the first area as default if there is sp under this area
			if ($scope.sp_under_area.length > 0) {
				$scope.selected_sp_name = $scope.sp_under_area[0].name;
			}
		}



	});

	// add watch to $scope.selected_area
	$scope.$watch(
		function(scope) {
			return scope.selected_area
		},
		function(newValue, oldValue) {
			if (newValue === oldValue) {
				return;
			}
			if ($scope.selected_month.length && $scope.selected_area.length) {
				// since area selected changed, retrieve chart
				retriveAndDrawShareoutCharts($scope, $http, last_fully_updated_month);
			}


			// update stockpoint list
			var sp_under_area = []
			if ($scope.stockpoints == undefined)
				return;

			for (var i in $scope.stockpoints) {
				if ($scope.stockpoints[i].area == newValue) {
					sp_under_area.push($scope.stockpoints[i])
				}
			}
			// unbind the listeners first, create new sp list and bind again
			$('.sp-selection').unbind()
			$scope.sp_under_area = sp_under_area;

		}
	);

	// add watch to $scope.selected_month
	$scope.$watch(
		function(scope) {
			return scope.selected_month
		},
		function(newValue, oldValue) {
			if (newValue === oldValue) {
				return;
			}
			if (!$scope.selected_month.length || !$scope.selected_area.length) {
				return;
			}
			// since month selected changed, retrieve chart 
			retriveAndDrawShareoutCharts($scope, $http, last_fully_updated_month);
			if (!$scope.selected_sp_name.length) {
				return;
			}
			retriveAndDrawShareoutSPProductChart($scope, $http, last_fully_updated_month);

		}
	);
	// add watch to $scope.selected_sp_name
	$scope.$watch(
		function(scope) {
			return scope.selected_sp_name
		},
		function(newValue, oldValue) {
			if (newValue === oldValue) {
				return;
			}
			if (!$scope.selected_sp_name.length || !$scope.selected_month.length) {
				return;
			}
			// since stockpoint selected changed, retrieve chart
			// get product sold by sp chart
			retriveAndDrawShareoutSPProductChart($scope, $http, last_fully_updated_month)

		}
	);

	// listener for clicking to change area
	var areaSelectionListener = function() {
		var area = this.innerHTML;

		$scope.selected_area = area;
		$scope.$digest()

	}

	// listener for clicking to change stockpoint
	var spSelectionListener = function() {
		var sp_name = this.innerHTML;
		$scope.selected_sp_name = sp_name;
		$scope.$digest();

	}

	// initialize month selector
	$('#datepicker').datepicker({
		format: "M-yy",
		viewMode: "months",
		minViewMode: "months",
		startDate: 'Jun-14',
		endDate: last_fully_updated_month
	}).on('changeDate', function(e) {
		var month = e.format("M-yy");

		$scope.selected_month = month;
		$scope.$digest();
	});
	$('#datepicker').datepicker('update', last_fully_updated_month)
}

/**
 * Set up weekly fo submission table
 */
function setupWeeklyFOSubmission($scope, $http) {
	$scope.start_date = ''
	$scope.end_date = ''
	$scope.title = 'FO CommCare Submission';
	$('#datepicker-weekly-fo-submission').datepicker({
		orientation: 'auto',
		format: 'yyyy/mm/dd',
		weekStart: 1
	}).on('changeDate', function(e) {
		if (e.target.id == 'date-picker-weekly-start') {
			$scope.start_date = e.format('yyyy-mm-dd')
			$scope.$digest();
		} else if (e.target.id == 'date-picker-weekly-end') {
			$scope.end_date = e.format('yyyy-mm-dd');
			$scope.$digest();
		}
	});


	var date_change_listener = function() {

		var params = {
			start_date: $scope.start_date,
			end_date: $scope.end_date
		}

		$http.get(appendParamsToUrl('../api/ops-report/weekly-fo-submission', params)).success(function(data) {
			console.log(data)
			if (data.by_date.length == 0) {
				$('#weekly-fo-date-table-div').hide();
				$('#fo-submission-no-data').show();
				return;
			} else {
				$('#weekly-fo-date-table-div').show();
				$('#fo-submission-no-data').hide();
			}
			var by_date_header = ['username']
			var by_date_rows = [];
			var by_date_content = {
				total: {
					username: 'all users',
					total: 0
				}
			};

			var by_form_header = ['username']
			var by_form_rows = [];
			var by_form_content = {
				total: {
					username: 'all users',
					total: 0
				}
			};
			if (data == {}) {
				return;
			}

			// prepare by date header, row and data
			for (var i in data.by_date) {
				var date = data.by_date[i].date;
				var username = data.by_date[i].username;

				if (by_date_header.indexOf(date) == -1) {
					by_date_header.push(data.by_date[i].date)
				}
				if (by_date_rows.indexOf(username) == -1) {
					by_date_rows.push(data.by_date[i].username)
				}
				if (by_date_content[username] == undefined) {
					by_date_content[username] = {
						username: data.by_date[i].username,
						total: 0
					}
				}
				var count = data.by_date[i].count;
				by_date_content[username][date] = count;
				by_date_content[username]['total'] += count;
				by_date_content['total']['total'] += count;
				if (by_date_content['total'][date] == undefined) {
					by_date_content['total'][date] = 0
				}
				by_date_content['total'][date] += count;
			}
			by_date_header.push('total');
			by_date_rows.push('total')

			// prepare by form header, row and data
			for (var i in data.by_form) {
				var form = data.by_form[i].form;
				var username = data.by_form[i].username;

				if (by_form_header.indexOf(form) == -1) {
					by_form_header.push(data.by_form[i].form)
				}
				if (by_form_rows.indexOf(username) == -1) {
					by_form_rows.push(data.by_form[i].username)
				}
				if (by_form_content[username] == undefined) {
					by_form_content[username] = {
						username: data.by_form[i].username,
						total: 0
					}
				}
				var count = data.by_form[i].count;
				by_form_content[username][form] = count;
				by_form_content[username]['total'] += count;
				by_form_content['total']['total'] += count;
				if (by_form_content['total'][form] == undefined) {
					by_form_content['total'][form] = 0
				}
				by_form_content['total'][form] += count;

			}
			by_form_header.push('total');
			by_form_rows.push('total');

			// update scope variable
			$scope.by_date_header = by_date_header;
			$scope.by_date_rows = by_date_rows;
			$scope.by_date_content = by_date_content;

			$scope.by_form_header = by_form_header;
			$scope.by_form_rows = by_form_rows;
			$scope.by_form_content = by_form_content;

		});
	}

	// add watch to start_date
	$scope.$watch(
		function(scope) {
			return scope.start_date
		},
		function(newValue, oldValue) {
			if (newValue === oldValue) {
				return;
			}

			// if start_date changed, query new table
			if ($scope.end_date.length > 0 && $scope.start_date.length > 0 && $scope.start_date != $scope.end_date) {
				date_change_listener()
			}
		}
	);
	// add watch to end_date
	$scope.$watch(
		function(scope) {
			return scope.end_date
		},
		function(newValue, oldValue) {
			if (newValue === oldValue) {
				return;
			}

			// if start_date changed, query new table
			if ($scope.end_date.length > 0 && $scope.start_date.length > 0 && $scope.start_date != $scope.end_date) {
				date_change_listener()
			}
		}
	);

	// update the picker time, default last week
	var now = moment();
	now.add(-7, 'days');

	$('#date-picker-weekly-start').datepicker('update', now.isoWeekday(1).toDate());
	$('#date-picker-weekly-end').datepicker('update', now.isoWeekday(7).toDate());
	$scope.start_date = now.isoWeekday(1).format('YYYY-MM-DD');
	$scope.end_date = now.isoWeekday(7).format('YYYY-MM-DD');
	date_change_listener()

}

/**
 * Set up weekly challenge action
 */
function setupChallengeAction($scope, $http) {
	$scope.title = 'Challenges & Actions';
	$scope.start_date = '';
	$scope.end_date = '';
	$scope.area = '';

	$('#datepicker-challenge').datepicker({
		orientation: 'auto',
		format: 'yyyy/mm/dd',
		weekStart: 1
	}).on('changeDate', function(e) {
		if (e.target.id == 'date-picker-challenge-start') {
			$scope.start_date = e.format('yyyy-mm-dd')
			$scope.$digest();
		} else if (e.target.id == 'date-picker-challenge-end') {
			$scope.end_date = e.format('yyyy-mm-dd');
			$scope.$digest();
		}
	});
	var until_month = moment().format('MMM-YY');


	var area_date_change_listener = function() {
		if ($scope.area.length > 0 && $scope.end_date.length > 0 && $scope.start_date.length > 0 && $scope.start_date != $scope.end_date) {
			var params = {
				area: $scope.area,
				start_date: $scope.start_date,
				end_date: $scope.end_date
			}
			$http.get(appendParamsToUrl('../api/ops-report/challenge-action', params)).success(function(data) {
				if (data.length == 0) {
					$('#challenge-action-data-table').hide();
					$('#challenge-action-no-data').show();
					return;
				} else {
					$('#challenge-action-data-table').show();
					$('#challenge-action-no-data').hide();
				}
				var header = ['Date', 'Stockpoint ID', 'Name', 'Challenges', 'Action Plan']
				$scope.sp_visit_header = header;
				$scope.sp_visit_content = data
			});
			$http.get(appendParamsToUrl('../api/ops-report/action-plan', params)).success(function(data) {
				if (data.length == 0) {
					$('#challenge-action-data-table').hide();
					$('#challenge-action-no-data').show();
					return;
				} else {
					$('#challenge-action-data-table').show();
					$('#challenge-action-no-data').hide();
				}
				var header = ['Date', 'Event Type', 'Venue', 'Feedback', 'Action Plan']
				$scope.event_header = header;
				$scope.event_content = data
			});

		} else {
			return;
		}


	}


	initializeTab($http, $scope, null, until_month, function() {
		$(this).tab('show');
		$scope.area = this.id;
		$scope.$digest();
	}, function() {
		//post render, select the first area
		$($('.fo-area-selection')[0]).tab('show');
		$scope.area = $('.fo-area-selection')[0].id;
	});
	// add watch to area
	$scope.$watch(
		function(scope) {
			return scope.area
		},
		function(newValue, oldValue) {
			if (newValue === oldValue) {
				return;
			}

			// if start_date changed, query new table
			area_date_change_listener()

		}
	);
	// add watch to start_date
	$scope.$watch(
		function(scope) {
			return scope.start_date
		},
		function(newValue, oldValue) {
			if (newValue === oldValue) {
				return;
			}

			// if start_date changed, query new table
			area_date_change_listener()

		}
	);

	// add watch to end_date
	$scope.$watch(
		function(scope) {
			return scope.end_date
		},
		function(newValue, oldValue) {
			if (newValue === oldValue) {
				return;
			}

			// if start_date changed, query new table
			area_date_change_listener()

		}
	);

	// update the picker time, default last week, update the area, default the first tab
	var now = moment();
	now.add(-7, 'days');

	$('#date-picker-challenge-start').datepicker('update', now.isoWeekday(1).toDate());
	$('#date-picker-challenge-end').datepicker('update', now.isoWeekday(7).toDate());
	$scope.start_date = now.isoWeekday(1).format('YYYY-MM-DD');
	$scope.end_date = now.isoWeekday(7).format('YYYY-MM-DD');
	area_date_change_listener()

}

/**
 * Setup delivery report
 */
function setupDeliveryReport($scope, $http) {
	$scope.title = 'MTD Delivery Report';
	initializeTab($http, $scope, null, null, function() {
		$(this).tab('show');
		var id0 = this.id.split('-')[0];
		var id1 = this.id.split('-')[1];
		if (id0 == 'fo') {
			$scope.params = {
				fo: id1
			}
			$scope.selected_fo = (id1 + ",");
			$scope.area = "Overall";
		} else if (id0 == 'bloom') {
			$scope.params = {}
			$scope.selected_fo = "Bloom,";
			$scope.area = "Overall";
		} else {
			$scope.params = {
				area: id1
			}
			$scope.selected_fo = (id0 + ",");
			$scope.area = id1;
		}
		$scope.$digest();
	}, function() {
		// post render, set the params to initialize the params variable in scope to activate the watch
		$scope.params = {};
		$scope.$digest();
		$scope.selected_fo = "Bloom,";
		$scope.area = "Overall";
	});

	// add watch to params
	$scope.$watch(
		function(scope) {
			return scope.params
		},
		function(newValue, oldValue) {
			if (JSON.stringify(newValue) === JSON.stringify(oldValue)) {
				return;
			}

			fo_area_change();

		}
	);
	var fo_area_change = function() {
		$http.get(appendParamsToUrl('../api/ops-report/delivery-report', $scope.params)).success(function(data) {
			var delivery_report_header = ['Area', 'Stockpoint ID', 'Stockpoint Name', 'Product', data.month.pre_month, data.month.this_month]
			var delivery_report_content = {};

			var summary_header = ['Company', data.month.pre_month, data.month.this_month]
			var summary_content = {
				mars_total: ['Mars Total', 0, 0],
				wrigley_total: ['Wrigley Total', 0, 0],
				total: ['Total', 0, 0]
			}

			var pre_month = data.month.pre_month;
			var this_month = data.month.this_month;

			for (var i in data.pre_month) {
				var id = data.pre_month[i]['Stockpoint ID'] + data.pre_month[i]['Product']
				delivery_report_content[id] = {
					'Area': data.pre_month[i]['Area'],
					'Stockpoint ID': data.pre_month[i]['Stockpoint ID'],
					'Stockpoint Name': data.pre_month[i]['Stockpoint Name'],
					'Product': data.pre_month[i]['Product']
				}
				delivery_report_content[id][pre_month] = data.pre_month[i]['Sum'];
				delivery_report_content[id][this_month] = 0;

				// update total for each company, pre month
				if (getCompanyName(data.pre_month[i]['Product']) == 'mars') {
					summary_content.mars_total[1] += data.pre_month[i]['Sum'];
					summary_content.total[1] += data.pre_month[i]['Sum'];
				} else {
					summary_content.wrigley_total[1] += data.pre_month[i]['Sum'];
					summary_content.total[1] += data.pre_month[i]['Sum'];
				}
			}

			for (var i in data.this_month) {
				var id = data.this_month[i]['Stockpoint ID'] + data.this_month[i]['Product']
				if (id in delivery_report_content) {
					delivery_report_content[id][this_month] = data.this_month[i]['Sum'];
				} else {
					delivery_report_content[id] = {
						'Area': data.this_month[i]['Area'],
						'Stockpoint ID': data.this_month[i]['Stockpoint ID'],
						'Stockpoint Name': data.this_month[i]['Stockpoint Name'],
						'Product': data.this_month[i]['Product']
					}
					delivery_report_content[id][pre_month] = 0;
					delivery_report_content[id][this_month] = data.this_month[i]['Sum'];
				}

				// update total for each company, this month
				if (getCompanyName(data.this_month[i]['Product']) == 'mars') {
					summary_content.mars_total[2] += data.this_month[i]['Sum'];
					summary_content.total[2] += data.this_month[i]['Sum'];
				} else {
					summary_content.wrigley_total[2] += data.this_month[i]['Sum'];
					summary_content.total[2] += data.this_month[i]['Sum'];
				}
			}
			delivery_report_content = sortObjectByKey(delivery_report_content);
			$scope.delivery_report_content = delivery_report_content
			$scope.delivery_report_header = delivery_report_header
			$scope.summary_content = summary_content;

		});
	}

}

/**
 * Helper function to append dictionary of parameters to a url for HTTP GET
 */
function appendParamsToUrl(url, params) {
	var url_with_param = url
	var isFirst = true
	for (var key in params) {
		if (isFirst) {
			if (params[key] == '') {
				continue;
			}
			url_with_param += '?' + key + '=' + params[key];
			isFirst = false;
		} else {
			if (params[key] == '') {
				continue;
			}
			url_with_param += '&' + key + '=' + params[key];
		}
	}
	return url_with_param;
}

/**
 * Helper function for drawing time series stacked column chart (for uplifter man hour and uplifter by area)
 */

function timeseriersStackedColumnChart($scope, chart_name, options, data, last_fully_updated_month) {
	$scope[chart_name] = {
		type: "ColumnChart",
		displayed: true,
		formatter: {}
	}

	var chart_data = {
		cols: [{
			id: "month",
			label: "Month",
			type: "date",
		}],
		rows: []
	}

	// fetch cols

	var areas = [];
	for (var i in data) {
		if (areas.indexOf(data[i].area) == -1) {
			areas.push(data[i].area);

		}
	}
	areas.sort();
	for (var i in areas) {
		chart_data.cols.push({
			label: areas[i],
			type: "number"
		});
	}
	// fill last col as annotation to show total count
	chart_data.cols.push({
		type: "number"
	});
	chart_data.cols.push({
		type: "number",
		role: "annotation",
		p: {
			role: "annotation"
		}
	});

	options['series'] = {};
	options.series[chart_data.cols.length - 3] = {
		type: 'line',
		color: 'grey',
		lineWidth: 0,
		pointSize: 0,
		visibleInLegend: false
	}

	// fill cols with 0
	var startDate = moment('2014/6/1', 'YYYY-MM-DD');
	var now = moment(last_fully_updated_month, 'MMM-YY');
	now.add(1, 'months');
	var data_array = [];
	while (monthDiff(startDate, now) != 0) {
		var row = {
			c: [{
				v: new Date(startDate.format('YYYY-MM-DD'))
			}]
		}
		for (var i in areas) {
			row.c.push({
				v: 0
			});
		}
		// last 2 cols, which is total count and invisible line, is also 0
		row.c.push({
			v: 0
		});
		row.c.push({
			v: 0
		});
		chart_data.rows.push(row);
		startDate.add(1, 'months');
	}
	// fill data
	for (var i in data) {
		var col_index = areas.indexOf(data[i].area) + 1;
		var row_index = monthDiff(moment('2014/6/1', 'YYYY-MM-DD'), moment(data[i].month, "MMM-YY"));
		if (row_index >= chart_data.rows.length) {
			continue;
		}
		chart_data.rows[row_index].c[col_index].v = data[i].count;
		chart_data.rows[row_index].c[chart_data.cols.length - 1].v += Math.round(data[i].count);
		chart_data.rows[row_index].c[chart_data.cols.length - 2].v += Math.round(data[i].count);
	}

	// draw chart!
	$scope[chart_name].data = chart_data;
	$scope[chart_name].options = options;

}

/**
 * Helper function for getting the company name with product name given
 */
function getCompanyName(product) {
	switch (product) {
		case 'DM 50+10':
		case 'JF 50+10':
		case 'Sugus 34':
		case 'Skittles 15g':
		case 'DM sticks 2+1':
			return 'wrigley';
			break;
		case 'Snickers 20g':
		case 'M&Ms 14.5g':
			return 'mars';
			break;
	}
}

function get_last_three_month(selected_month) {
	var months = []
	var this_month = moment(selected_month, 'MMM-YY');
	for (var i = 0; i < 3; i++) {
		months.unshift(this_month.format('MMM-YY'));
		this_month.add(-1, 'months');
	}

	return months;
}

function toggle_tab(class_name, id_to_show) {
	$("." + class_name).each(function() {
		$(this).hide();
	})
	if (id_to_show != null) {
		$("#" + id_to_show).show();
	}
}

/**
 * parse json to csv and download it
 */
function parseJsonToCsv($http, url, file_name) {
	$http.get(url).success(function(data) {
		var scv_str = Papa.unparse(data.results)

		var uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(scv_str);
		var downloadLink = document.createElement("a");

		downloadLink.href = uri;
		downloadLink.download = file_name;

		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);

	});
}

/**
 * Return an Object sorted by it's Key
 */
var sortObjectByKey = function(obj) {
	var keys = [];
	var sorted_obj = {};

	for (var key in obj) {
		if (obj.hasOwnProperty(key)) {
			keys.push(key);
		}
	}

	// sort keys
	keys.sort();

	// create new array based on Sorted Keys
	jQuery.each(keys, function(i, key) {
		sorted_obj[key] = obj[key];
	});

	return sorted_obj;
};