/* 
 * @Author: archer
 * @Date:   2015-08-13 15:34:44
 * @Last Modified 2015-08-14
 */

'use strict';
var header_structure = [];
var response_data = {}

var dashboardControllers = angular.module('dashboardControllers', []);

dashboardControllers.controller('DashboardOverviewCtrl', ['$scope', '$http',
	function ($scope, $http) {
		console.log('a')
	}
]);

dashboardControllers.controller('DashboardTableCtrl', ['$scope', '$routeParams', '$http',
	function ($scope, $routeParams, $http) {
		// Set title
		var url;
		if ($routeParams.table_type == 'sale') {
			$scope.title = 'Sale Table'
			url = '../api/' + $routeParams.table_type;
		} else if ($routeParams.table_type == 'product_margin') {
			$scope.title = 'Product Margin Table'
			url = '../api/' + $routeParams.table_type + '/latest';
		} else if ($routeParams.table_type == 'delivery') {
			$scope.title = 'Delivery Table'
			url = '../api/' + $routeParams.table_type;
		}

		// setup paginator
		var options = {
			bootstrapMajorVersion: 3,
			useBootstrapTooltip: true,
			onPageClicked: function (e, originalEvent, type, page) {
                retriveTableData(url, page, 10, $http, $scope, $('#data-table-paginator'));
            },
			itemContainerClass: function (type, page, current) {
                return (page === current) ? "active" : "pointer-cursor";
            }
		}

		$('#data-table-paginator').bootstrapPaginator(options);
		retriveTableData(url, 1, 10, $http, $scope, $('#data-table-paginator'))

	}
]);

dashboardControllers.controller('DashboardChartCtrl', ['$scope', '$http',
	function ($scope, $http) {
		console.log('c')
	}
]);

dashboardControllers.controller('DashboardFormCtrl', ['$scope', '$http',
	function ($scope, $http) {
		console.log('d')
	}
]);

dashboardControllers.controller('DashboardExportCtrl', ['$scope', '$http',
	function ($scope, $http) {
		console.log('e')
	}
]);

function retriveTableData(url, page_num, page_size, $http, $scope, table) {
	// add page number to http get parameter
	url = url + '?page=' + page_num;

	// retrive data
	$http.get(url).success(function (data) {
		header_structure = [];
		for (var k in data.results[0]) {
			header_structure.push({
				"data": k
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
		}
		else {
			$scope.y = data.count;
		}

	});
}