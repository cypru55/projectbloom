/* 
* @Author: archer
* @Date:   2015-08-12 17:52:19
* @Last Modified 2015-08-14
*/

'use strict';

var dashboardApp = angular.module('dashboardApp', [
  'ngRoute',
  'dashboardControllers',
]);

dashboardApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/dashboard', {
        templateUrl: '/static/dashboard/partials/dashboard.html',
        controller: 'DashboardOverviewCtrl'
      }).
      when('/table/:table_type', {
        templateUrl: '/static/dashboard/partials/tables.html',
        controller: 'DashboardTableCtrl'
      }).
      when('/chart', {
        templateUrl: '/static/dashboard/partials/charts.html',
        controller: 'DashboardChartCtrl'
      }).
      when('/export', {
        templateUrl: '/static/dashboard/partials/export.html',
        controller: 'DashboardExportCtrl'
      }).
      when('/form', {
        templateUrl: '/static/dashboard/partials/forms.html',
        controller: 'DashboardFormCtrl'
      }).
      otherwise({
        redirectTo: '/dashboard'
      });
  }]);