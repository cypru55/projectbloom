/* 
 * @Author: archer
 * @Date:   2015-08-13 15:34:44
 * @Last Modified 2015-08-28
 */

'use strict';

// Bootstrap the angular app after google chart is loaded

google.load('visualization', '1', {
	packages: ['corechart']
});

google.setOnLoadCallback(function() {
	angular.bootstrap(document.body, ['dashboardApp']);
});

// Define angular controllers
var dashboardControllers = angular.module('dashboardControllers', []);

dashboardControllers.controller('DashboardOverviewCtrl', ['$scope', '$http',
	function($scope, $http) {
		// retrieve data
		var url = "../api/overview";
		var data_array = [
			["Month", "Total Stable UL", "New UL", "Stable SP", "New SP"],
			[new Date('2014/6/1'), null, null, null, null],
			[new Date('2014/7/1'), null, null, null, null],
			[new Date('2014/8/1'), null, null, null, null],
			[new Date('2014/9/1'), null, null, null, null],
			[new Date('2014/10/1'), null, null, null, null],
			[new Date('2014/11/1'), null, null, null, null],
			[new Date('2014/12/1'), null, null, null, null],
			[new Date('2015/1/1'), null, null, null, null],
			[new Date('2015/2/1'), null, null, null, null],
			[new Date('2015/3/1'), null, null, null, null],
			[new Date('2015/4/1'), null, null, null, null],
			[new Date('2015/5/1'), null, null, null, null],
			[new Date('2015/6/1'), null, null, null, null],
			[new Date('2015/7/1'), null, null, null, null],
			[new Date('2015/8/1'), null, null, null, null]
		];
		$http.get(url).success(function(data) {

			for (var i in data['ul_overview']) {
				var month = moment(data['ul_overview'][i]['month'], "MMM-YY");
				var startDate = moment('2014/6/1');
				var index = monthDiff(startDate, month) + 1;
				if (data['ul_overview'][i]['status'] == 'EE') {
					data_array[index][1] = data['ul_overview'][i]['count']
				} else if (data['ul_overview'][i]['status'] == 'N') {
					data_array[index][2] = data['ul_overview'][i]['count']
				}
			}

			for (var i in data['sp_overview']) {
				var month = moment(data['sp_overview'][i]['month'], "MMM-YY");
				var startDate = moment('2014/6/1');
				var index = monthDiff(startDate, month) + 1;
				if (data['sp_overview'][i]['status'] == 'SP') {
					data_array[index][3] = data['sp_overview'][i]['count']
				} else if (data['sp_overview'][i]['status'] == 'N') {
					data_array[index][4] = data['sp_overview'][i]['count']
				}
			}

			// google charts
			var data = google.visualization.arrayToDataTable(data_array);
			var options = {
				title: "Bloom Overview",
				isStacked: "true",
				fill: 20,
				displayExactValues: true,
				hAxis: {
					"title": "Date",
					"format": 'MMM-yy',
					gridlines: {
						"count": 15
					}
				},
				seriesType: 'bars',
				vAxis: {
					title: "Entrepreneur",
					gridlines: {
						"count": 10
					}
				},
				width: 800,
				height: 400

			}

			var chart = new google.visualization.ColumnChart(document.getElementById('chart_div1'));
			chart.draw(data, options);
		});


		
		// another chart

		var data2 = google.visualization.arrayToDataTable([
			["Month", "Total Stable SP", "Dropped UL", "Retention UL"],
			[new Date('2014/6/1'), 0, 0, null],
			[new Date('2014/7/1'), 0, 0, null],
			[new Date('2014/8/1'), 3, 0, null],
			[new Date('2014/9/1'), 5, 0, null],
			[new Date('2014/10/1'), 12, 0, 1],
			[new Date('2014/11/1'), 19, 0, 1],
			[new Date('2014/12/1'), 22, 0, 1],
			[new Date('2015/1/1'), 23, -1, 0.94],
			[new Date('2015/2/1'), 23, -1, 0.94],
			[new Date('2015/3/1'), 26, -1, 0.93],
			[new Date('2015/4/1'), 30, -2, 0.90],
			[new Date('2015/5/1'), 40, -1, 0.97],
			[new Date('2015/6/1'), 49, 0, 1],
			[new Date('2015/7/1'), 53, -9, 0.8],
			[new Date('2015/8/1'), 60, -3, 0.94]
		]);

		var options2 = {
			title: "Uplifter Retention",
			isStacked: "true",
			fill: 20,
			displayExactValues: true,
			hAxis: {
				title: "Date",
				format: 'MMM-yy',
				gridlines: {
					"count": 15
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
					gridlines: {
						"count": 10
					}
				},
				1: {
					title: "UL Retention",
					gridlines: {
						"count": 10
					},
					format: '#%',
					maxValue: 1,
					minValue: 0
				}
			},
			width: 800,
			height: 400
		}
		var chart = new google.visualization.ColumnChart(document.getElementById('chart_div2'));

		chart.draw(data2, options2);

	}
]);

dashboardControllers.controller('DashboardTableCtrl', ['$scope', '$routeParams', '$http',
	function($scope, $routeParams, $http) {
		// Set title
		var url;
		if ($routeParams.data_type == 'sale') {
			$scope.title = 'Sale Table'
			url = '../api/' + $routeParams.data_type;
			$('#product-margin-type-selector').hide();

		} else if ($routeParams.data_type == 'product_margin') {
			$scope.title = 'Product Margin Table'
			url = '../api/' + $routeParams.data_type + '/latest';
			$scope.type = 'latest';
			$('#product-margin-type-selector').show();


			// add listener for list selector

		} else if ($routeParams.data_type == 'delivery') {
			$scope.title = 'Delivery Table'
			url = '../api/' + $routeParams.data_type;
			$('#product-margin-type-selector').hide();

		}

		// setup the product margin type selector
		$('#product-margin-type-list').click(function(event) {
			var type = event.target.getAttribute("value");
			url = "../api/product_margin/" + type;
			$scope.type = type;
			retriveAndDrawDataTable(url, 1, 10, $http, $scope, $('#data-table-paginator'));
		});

		// setup paginator
		var options = {
			bootstrapMajorVersion: 3,
			useBootstrapTooltip: true,
			onPageClicked: function(e, originalEvent, type, page) {
				retriveAndDrawDataTable(url, page, 10, $http, $scope, $('#data-table-paginator'));
			},
			itemContainerClass: function(type, page, current) {
				return (page === current) ? "active" : "pointer-cursor";
			}
		}

		$('#data-table-paginator').bootstrapPaginator(options);
		retriveAndDrawDataTable(url, 1, 10, $http, $scope, $('#data-table-paginator'))

	}
]);

dashboardControllers.controller('DashboardPivotCtrl', ['$scope', '$routeParams', '$http',
	function($scope, $routeParams, $http) {
		// initializing local variables
		var url;
		var params = {
			option: 'weekly'
		};
		$scope.type = 'weekly'
		var headers = []

		// initialize date picker
		var today = moment();
		var four_weeks_ago = moment();
		four_weeks_ago.subtract(27, 'days');
		params['sd'] = four_weeks_ago.format('YYYY-MM-DD');
		params['ed'] = today.format('YYYY-MM-DD');

		$('.input-daterange').datepicker({
			orientation: 'auto',
			format: 'yyyy/mm/dd',

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
		// set default to 4 weeks agon to today
		$('.input-daterange #date-picker-start').datepicker('update', four_weeks_ago.toDate());
		$('.input-daterange #date-picker-end').datepicker('update', today.toDate());

		// configure the url according to pivot table type
		switch ($routeParams['table_type']) {
			case 'sp_products_sold':
				$scope.title = "Stockpoint Products Sold";
				url = '../api/sale/sp-products-sold'
				headers = ['area', 'stockpoint_name', 'product']

				break;
			case 'ul_days_worked':
				$scope.title = "Uplifter Days Worked";
				url = '../api/sale/ul-days-worked'
				headers = ['area', 'stockpoint_name', 'uplifter_name']
				break;
			case 'ul_income':
				$scope.title = "Uplifter Income";
				url = '../api/sale/ul-income'
				headers.push('uplifter_name')
				headers = ['area', 'stockpoint_name', 'uplifter_name']

				break;
			case 'sp_income':
				$scope.title = "Stockpoint Income";
				url = '../api/sale/sp-income'
				headers = ['area', 'stockpoint_name']

				break;
		}

		// setup the period type selector
		$('#pivot-table-option-list').click(function(event) {
			params['option'] = event.target.getAttribute("value");
			$scope.type = event.target.getAttribute("value");
			retriveAndDrawPivotTable(url, params, headers, $http, $scope);
		});

		// retrieve default pivot table
		retriveAndDrawPivotTable(url, params, headers, $http, $scope);

	}
]);

dashboardControllers.controller('DashboardChartCtrl', ['$scope', '$http',
	function($scope, $http) {
		console.log('c')
	}
]);

dashboardControllers.controller('DashboardFormCtrl', ['$scope', '$http',
	function($scope, $http) {
		console.log('d')
	}
]);

dashboardControllers.controller('DashboardExportCtrl', ['$scope', '$http',
	function($scope, $http) {
		console.log('e')
	}
]);

/**
 * Helper function for retriving data
 */
function retriveAndDrawDataTable(url, page_num, page_size, $http, $scope, table) {
	// add page number to http get parameter
	url = url + '?page=' + page_num;

	// retrive data
	$http.get(url).success(function(data) {
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
		$scope.x = (page_num - 1) * page_size + 1;
		if (page_num * page_size < data.count) {
			$scope.y = page_num * page_size;
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
	var isFirst = true
	for (var key in params) {
		if (isFirst) {
			url_with_param += '?' + key + '=' + params[key];
			isFirst = false;
		} else {
			url_with_param += '&' + key + '=' + params[key];
		}
	}

	// send http get request
	$http.get(url_with_param).success(function(data) {
		if (data.data.length > 0) {
			$('#dataTable').show();
			$('#paginator-div').show();
			$('#no-data-sign').hide();
			var header_structure = headers.concat(data.headers);
			var parsed_headers = []
			for (var k in header_structure) {
				parsed_headers.push(parseHeader(header_structure[k], params.option));

			}
			// update view
			$scope.header_structure = header_structure;
			$scope.parsed_headers = parsed_headers;
			$scope.data = data.data;
		} else {
			$('#dataTable').hide();
			$('#paginator-div').hide();
			$('#no-data-sign').show();

		}

	});
}

/**
 * Helper function to check is the string is a validate date
 */
var isDate = function(date) {
	return ((new Date(date) !== "Invalid Date" && !isNaN(new Date(date))));
}

/**
 * Helper function to parse header for display
 */

var parseHeader = function(header, option) {
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

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

// helper function to calculate month difference, using moment
function monthDiff(d1, d2) {
	var months;
	months = (d2.year() - d1.year()) * 12;
	months -= d1.month() + 1;
	months += d2.month();
	return months <= 0 ? 0 : months;
}