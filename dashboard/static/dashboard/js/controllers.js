/* 
 * @Author: archer
 * @Date:   2015-08-13 15:34:44
 * @Last Modified 2015-08-26
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
		// google charts
		var data = google.visualization.arrayToDataTable([
			["Month", "Total Stable UL", "New UL", "Stable SP", "New SP"],
			['2014/6/1', 0, 4, 0, 1],
			['2014/7/1', 0, 5, 0, 1],
			['2014/8/1', 3, 9, 1, 3],
			['2014/9/1', 5, 16, 1, 4],
			['2014/10/1', 12, 13, 4, 1],
			['2014/11/1', 19, 5, 5, 0],
			['2014/12/1', 22, 3, 5, 0],
			['2015/1/1', 23, 6, 5, 0],
			['2015/2/1', 23, 22, 5, 6],
			['2015/3/1', 26, 59, 5, 13],
			['2015/4/1', 30, 37, 10, 8],
			['2015/5/1', 40, 26, 13, 4],
			['2015/6/1', 49, 23, 12, 6],
			['2015/7/1', 53, 52, 14, 15],
			['2015/8/1', 60, 35, 17, 10]
		]);
		var options = {
			title: "Bloom Overview",
			isStacked: "true",
			fill: 20,
			displayExactValues: true,
			hAxis: {
				"title": "Date",
				"format": 'MMM-yy'
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
		// another chart

		var data2 = google.visualization.arrayToDataTable([
			["Month", "Total Stable SP", "Dropped UL", "Retention UL"],
			['2014/6/1', 0, 0, null],
			['2014/7/1', 0, 0, null],
			['2014/8/1', 3, 0, null],
			['2014/9/1', 5, 0, null],
			['2014/10/1', 12, 0, 1],
			['2014/11/1', 19, 0, 1],
			['2014/12/1', 22, 0, 1],
			['2015/1/1', 23, -1, 0.94],
			['2015/2/1', 23, -1, 0.94],
			['2015/3/1', 26, -1, 0.93],
			['2015/4/1', 30, -2, 0.90],
			['2015/5/1', 40, -1, 0.97],
			['2015/6/1', 49, 0, 1],
			['2015/7/1', 53, -9, 0.8],
			['2015/8/1', 60, -3, 0.94]
		]);

		var options2 = {
			title: "Uplifter Retention",
			isStacked: "true",
			fill: 20,
			displayExactValues: true,
			hAxis: {
				title: "Date",
				format: 'MMM-yy'
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
		var today = new Date();
		var four_weeks_ago = new Date();
		four_weeks_ago.setDate(today.getDate() - 27);
		params['sd'] = four_weeks_ago.format('yyyy-mm-dd');
		params['ed'] = today.format('yyyy-mm-dd');

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
		$('.input-daterange #date-picker-start').datepicker('update', four_weeks_ago);
		$('.input-daterange #date-picker-end').datepicker('update', today);

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
		var start = new Date(header);

		var monthNames = ["January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December"
		];
		if (option == "weekly") {
			var end = new Date();
			end.setDate(start.getDate() + 6);
			return start.format('yyyy/mm/dd') + " To " + end.format('yyyy/mm/dd');
		} else if (option == "monthly") {
			return monthNames[start.getMonth()]
		}
	}
}

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

var dateFormat = function() {
	var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function(val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = "0" + val;
			return val;
		};

	// Regexes and supporting functions are cached through closure
	return function(date, mask, utc) {
		var dF = dateFormat;

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date;
		if (isNaN(date)) throw SyntaxError("invalid date");

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var _ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
				d: d,
				dd: pad(d),
				ddd: dF.i18n.dayNames[D],
				dddd: dF.i18n.dayNames[D + 7],
				m: m + 1,
				mm: pad(m + 1),
				mmm: dF.i18n.monthNames[m],
				mmmm: dF.i18n.monthNames[m + 12],
				yy: String(y).slice(2),
				yyyy: y,
				h: H % 12 || 12,
				hh: pad(H % 12 || 12),
				H: H,
				HH: pad(H),
				M: M,
				MM: pad(M),
				s: s,
				ss: pad(s),
				l: pad(L, 3),
				L: pad(L > 99 ? Math.round(L / 10) : L),
				t: H < 12 ? "a" : "p",
				tt: H < 12 ? "am" : "pm",
				T: H < 12 ? "A" : "P",
				TT: H < 12 ? "AM" : "PM",
				Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

		return mask.replace(token, function($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();

// Some common format strings
dateFormat.masks = {
	"default": "ddd mmm dd yyyy HH:MM:ss",
	shortDate: "m/d/yy",
	mediumDate: "mmm d, yyyy",
	longDate: "mmmm d, yyyy",
	fullDate: "dddd, mmmm d, yyyy",
	shortTime: "h:MM TT",
	mediumTime: "h:MM:ss TT",
	longTime: "h:MM:ss TT Z",
	isoDate: "yyyy-mm-dd",
	isoTime: "HH:MM:ss",
	isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
	dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

// For convenience...
Date.prototype.format = function(mask, utc) {
	return dateFormat(this, mask, utc);
};