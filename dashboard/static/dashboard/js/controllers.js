/* 
 * @Author: archer
 * @Date:   2015-08-13 15:34:44
 * @Last Modified 2015-09-18
 */

'use strict';

// Define angular controllers
var dashboardControllers = angular.module('dashboardControllers', []);

// color scheme
var color = {
	stable_ul: '#0099CC',
	new_ul: '#00CC66',
	stable_sp: '#FF9900',
	new_sp: '#FFFF66',
	drop: 'FF0000',
	retention: '993300',
	black: '000000'
}

dashboardControllers.controller('DashboardMonthlyCtrl', ['$scope', '$routeParams', '$http',
	function($scope, $routeParams, $http) {
		$http.get('../api/last-full-data-month').success(function(data) {
			var last_fully_updated_month = data[0].value;
			$scope.last_full_data_month = last_fully_updated_month
			initializeTab($http, $scope, $routeParams.tab, last_fully_updated_month);

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

// dashboardControllers.controller('DashboardShareoutCtrl', ['$scope', '$http',
// 	function($scope, $http) {
// 		// retrieve data
// 		initializeTab($http, $scope);
// 		var params = {
// 			fo: "Mark"
// 		}
// 		$scope.fo_name = "Mark"
// 		$scope.area = "Overall"
// 		retriveAndDrawChart(params, "Mark", $scope, $http);
// 		// retriveAndDrawShareoutCharts(area, $scope, $http)
// 	}
// ]);

// dashboardControllers.controller('DashboardQuaterlyCtrl', ['$scope', '$http', function($scope, $http) {
// 	// retriveAndDrawSPCharts($scope, $http)
// }]);

dashboardControllers.controller('DashboardTableCtrl', ['$scope', '$routeParams', '$http',
	function($scope, $routeParams, $http) {
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
			console.log(data);
		} else {
			$('#dataTable').hide();
			$('#paginator-div').hide();
			$('#no-data-sign').show();

		}

	});
}

/**
 * Helper function to retrieve data and draw charts
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
			title: title + " Recruitment",
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
			if (i != 0 && data_array[i - 1][7] != 0) {
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
						v: ((data_array[i - 1][7] - data_array[i][9]) / data_array[i - 1][7]).toFixed(2)
					}, {
						v: ((data_array[i - 1][7] - data_array[i][9]) / data_array[i - 1][7]).toFixed(2) * 100 + "%"
					}]
				})
			} else {
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
						v: null
					}, {
						v: null
					}]
				})
			}

		}

		var options2 = {
			title: title + " Uplifter Retention",
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
					format: '#',
					// gridlines: {
					// 	"count": 10
					// }
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
			annotations: {
				textStyle: {
					// The color of the text.
					color: color.black,
				}
			},
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
			if (i != 0 && data_array[i - 1][4] > 1) {
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
						v: ((data_array[i - 1][4] - 1 - data_array[i][6]) / (data_array[i - 1][4] - 1)).toFixed(2)
					}, {
						v: ((data_array[i - 1][4] - 1 - data_array[i][6]) / (data_array[i - 1][4] - 1)).toFixed(2) * 100 + "%"
					}]
				})
			} else {
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
						v: null
					}, {
						v: null
					}]
				})
			}

		}

		var options3 = {
			title: title + " Stockpoint Retention",
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
					title: "Stable Stockpoint",
					format: '#',
					// gridlines: {
					// 	"count": 10
					// }
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
				title: "Date",
				format: 'MMM-yy',
				gridlines: {
					"count": 15
				}
			},
			seriesType: 'line',
			series: {
				0: {
					type: 'bars',
					targetAxisIndex: 1
				}
			},
			interpolateNulls: true,
			vAxes: {
				0: {
					title: "Average Income/hr",
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
			// width: 800,
			height: 400
		}

		// second column is averate
		chart_data.cols.push({
			label: 'Total Average',
			type: 'number'
		})

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

			chart_data.rows.push(row);
			startDate.add(1, 'months');
		}

		// fill data
		for (var i in data['by_area']) {
			var col_index = areas.indexOf(data['by_area'][i].area) + 2;
			var row_index = monthDiff(moment('2014/6/1', 'YYYY-MM-DD'), moment(data['by_area'][i].month, "MMM-YY"));
			if (row_index >= chart_data.rows.length) {
				continue;
			}
			chart_data.rows[row_index].c[col_index].v = data['by_area'][i].profit_per_hour;

		}

		for (var i in data['average']) {
			var col_index = 1;
			var row_index = monthDiff(moment('2014/6/1', 'YYYY-MM-DD'), moment(data['average'][i].month, "MMM-YY"));
			if (row_index >= chart_data.rows.length) {
				continue;
			}
			chart_data.rows[row_index].c[col_index].v = data['average'][i].profit_per_hour;

		}

		// draw!
		$scope.estimatedIPHForSULChartObject.data = chart_data;
		$scope.estimatedIPHForSULChartObject.options = options;
	});
}

/**
 * Draw More charts which are project bloom specific and summaize data for the whole project
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
				"title": "Date",
				"format": 'MMM-yy',
				gridlines: {
					"count": 15
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
				"title": "Date",
				"format": 'MMM-yy',
				gridlines: {
					"count": 15
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
				"title": "Date",
				"format": 'MMM-yy',
				gridlines: {
					"count": 15
				}
			},
			seriesType: 'bars',
			vAxis: {
				title: "Estimated Man Hours",
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
				title: "Date",
				format: 'MMM-yy',
				gridlines: {
					"count": 15
				}
			},
			seriesType: 'line',
			series: {
				0: {
					type: 'bars',
					targetAxisIndex: 1
				},
				1: {
					type: 'bars',
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
			chart_data.rows[row_index].c[col_index].v = data['sku'][i].inner_bags_sum;

		}

		for (var i in data['rsv']) {
			var col_index = (data['rsv'][i].company == 'Wrigley' ? 4 : 5)
			var row_index = monthDiff(moment('2014/6/1', 'YYYY-MM-DD'), moment(data['rsv'][i].month, "MMM-YY"));
			if (row_index >= chart_data.rows.length) {
				continue;
			}
			chart_data.rows[row_index].c[col_index].v = data['rsv'][i].rsv;
			// add to sum
			chart_data.rows[row_index].c[3].v += data['rsv'][i].rsv;

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
				title: "Date",
				format: 'MMM-yy',
				gridlines: {
					"count": 15
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
				maxLines: 5
			},
			// width: 800,
			height: 400
		}

		// fetch cols 
		var products = []
		var companies = ['Mars', 'Wrigley']
		for (var i in data['by_product']) {
			if (products.indexOf(data['by_product'][i].product) == -1) {
				products.push(data['by_product'][i].product);
				chart_data.cols.push({
					label: data['by_product'][i].product,
					type: "number"
				});
			}
		}
		for (var i in companies) {
			chart_data.cols.push({
				label: companies[i],
				type: "number"
			});
		}

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
			chart_data.rows.push(row);
			startDate.add(1, 'months');
		}
		// fill data
		for (var i in data['by_product']) {
			var col_index = products.indexOf(data['by_product'][i].product) + 1;
			var row_index = monthDiff(moment('2014/6/1', 'YYYY-MM-DD'), moment(data['by_product'][i].month, "MMM-YY"));
			if (row_index >= chart_data.rows.length) {
				continue;
			}
			chart_data.rows[row_index].c[col_index].v = data['by_product'][i].qty_sum;
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
				"title": "Date",
				"format": 'MMM-yy',
				gridlines: {
					"count": 15
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
 * Draw More charts which are area specific charts
 */
function retriveAndDrawShareoutCharts(params, title, $scope, $http) {
	// http get for ul and sp potential (comcare)
	var url3 = appendParamsToUrl('../api/target', params);
	$http.get(url3).success(function(data) {
		// initialize data for uplifter tenure
		$scope.ulOverviewChartObject = {
			type: "ComboChart",
			displayed: true,
			formatter: {},
			options: {
				title: title + " Uplifter Overview",
				isStacked: "true",
				seriesType: 'bars',
				height: 400,
				legend: {
					position: "top"
				}
			}
		}

		$scope.spOverviewChartObject = {
			type: "ComboChart",
			displayed: true,
			formatter: {},
			options: {
				title: title + " Stockpoint Overview",
				isStacked: "true",
				seriesType: 'bars',
				height: 400,
				legend: {
					position: "top"
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
				}]
			}]
		}

		// consolidate data for last month ul
		for (var i in data.ul.last_month) {
			var ob = data.ul.last_month[i];
			if (ob.status == 'D') {
				ul_chart_data.rows[0].c[3].v += ob.count
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
				ul_chart_data.rows[1].c[3].v += ob.count
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
				sp_chart_data.rows[0].c[2].v += ob.count
			} else if (ob.status == 'S') {
				sp_chart_data.rows[0].c[1].v += ob.count
			} else if (ob.status == 'N') {
				sp_chart_data.rows[0].c[3].v += ob.count
			}
		}
		for (var i in data.sp.this_month) {
			var ob = data.sp.this_month[i]
			if (ob.status == 'D') {
				sp_chart_data.rows[1].c[2].v += ob.count
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

	// given a sp name, draw charts that show the qty of each product deliveried to this sp per month
	$http.get('../api/sp/product-sold-detail').success(function(data) {
		//console.log(data)
	});

	// given an area, draw charts that show the 3 months income for sp under this area
	$http.get('../api/area/sp-three-month-income').success(function(data) {
		//console.log(data)
	});

	// given an area, draw charts that show the 3 months purchase value for sp under this area
	$http.get('../api/area/sp-three-month-purchase-value').success(function(data) {
		//console.log(data)
	});

	// given an area and month , draw charts that show income and man-hours for ul under this area and month
	$http.get('../api/ul-income-and-man-hour').success(function(data) {
		//console.log(data)
	});

	// given an area and month , draw charts that show the days worked for this month, and improvement compared to previous month
	$http.get('../api/most-improved-days-worked').success(function(data) {
		//console.log(data)
	});
}

/**
 * Draw more charts which are stockpoint specific 
 */
function retriveAndDrawSPCharts($scope, $http) {

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
function initializeTab($http, $scope, tab, last_fully_updated_month) {
	var url = '../api/fo-area';
	$('#Overview-tab a').tab('show');
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
		$('.fo-area-selection').each(
			function() {
				$(this).click(
					tabSelectListener
				)
			}
		);
	});

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

		if (tab == 'kpi') {
			retriveAndDrawKPIChart(params, title, last_fully_updated_month, $scope, $http)
		} else if (tab == 'add') {
			retriveAndDrawAdditionalCharts(params, title, last_fully_updated_month, $scope, $http);
		}

	}
}

/**
 * Helper function to append dictionary of parameters to a url for HTTP GET
 * @param  {string} url    base url string
 * @param  {dictionary} params dictionary of parameters
 * @return {string}        url with parameters
 */
function appendParamsToUrl(url, params) {
	var url_with_param = url
	var isFirst = true
	for (var key in params) {
		if (isFirst) {
			url_with_param += '?' + key + '=' + params[key];
			isFirst = false;
		} else {
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
			chart_data.cols.push({
				label: data[i].area,
				type: "number"
			});
		}
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
		chart_data.rows[row_index].c[chart_data.cols.length - 1].v += data[i].count;
		chart_data.rows[row_index].c[chart_data.cols.length - 2].v += data[i].count;
	}

	// draw chart!
	$scope[chart_name].data = chart_data;
	$scope[chart_name].options = options;

}