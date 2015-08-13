/* 
* @Author: archer
* @Date:   2015-08-12 17:52:19
* @Last Modified 2015-08-13
*/

'use strict';

var dashboardApp = angular.module('dashboardApp', [
  'ngRoute',
  'dashboardControllers',
]);

dashboardApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/overview', {
        templateUrl: '/static/dashboard/partials/overview.html',
        controller: 'DashboardOverviewCtrl'
      }).
      when('/data', {
        templateUrl: '/static/dashboard/partials/data.html',
        controller: 'DashboardDataCtrl'
      }).
      when('/analytics', {
        templateUrl: '/static/dashboard/partials/analytics.html',
        controller: 'DashboardAnalyticsCtrl'
      }).
      when('/export', {
        templateUrl: '/static/dashboard/partials/export.html',
        controller: 'DashboardExportCtrl'
      }).
      otherwise({
        redirectTo: '/overview'
      });
  }]);