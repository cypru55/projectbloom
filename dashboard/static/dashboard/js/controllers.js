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
	function($scope, $http) {
		console.log('a')
	}
]);

dashboardControllers.controller('DashboardTableCtrl', ['$scope', '$routeParams', '$http',
	function($scope, $routeParams, $http) {
		// Set title
		if ($routeParams.table_type == 'sale') {
			$scope.title = 'Sale Table'
		} else if ($routeParams.table_type == 'product_margin') {
			$scope.title = 'Product Margin Table'
		} else if ($routeParams.table_type == 'delivery') {
			$scope.title = 'Delivery Table'
		}

		// retrive data
		$http.get('../api/' + $routeParams.table_type).success(function(data) {
			header_structure = [];
			for (var k in data.results[0]) {
				header_structure.push({
					"data": k
				});
			}
			$scope.headers = header_structure;
			response_data = data;
			$('#dataTable').DataTable({
				"scrollX": true,
				data: response_data.results,
				columns: header_structure
			});
		});
		// $scope.tableRenderCompleted = function() {
		// 	$('#dataTable').DataTable({
		// 		data: response_data.results,
		// 		columns: header_structure
		// 	});
		// }
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