/* 
 * @Author: archer
 * @Date:   2015-08-13 15:34:44
 * @Last Modified 2015-08-14
 */

'use strict';

var dashboardControllers = angular.module('dashboardControllers', []);

dashboardControllers.controller('DashboardOverviewCtrl', ['$scope', '$http',
	function($scope, $http) {
		console.log('a')
	}
]);

dashboardControllers.controller('DashboardTableCtrl', ['$scope','$routeParams' , '$http',
	function($scope, $routeParams, $http) {
		console.log($routeParams)
		console.log('b')
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