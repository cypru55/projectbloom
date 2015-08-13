/* 
 * @Author: archer
 * @Date:   2015-08-13 15:34:44
 * @Last Modified 2015-08-13
 */

'use strict';

var dashboardControllers = angular.module('dashboardControllers', []);

dashboardControllers.controller('DashboardOverviewCtrl', ['$scope', '$http',
	function($scope, $http) {
		console.log('a')
	}
]);

dashboardControllers.controller('DashboardDataCtrl', ['$scope', '$http',
	function($scope, $http) {
		console.log('b')
	}
]);

dashboardControllers.controller('DashboardAnalyticsCtrl', ['$scope', '$http',
	function($scope, $http) {
		console.log('c')
	}
]);

dashboardControllers.controller('DashboardExportCtrl', ['$scope', '$http',
	function($scope, $http) {
		console.log('d')
	}
]);