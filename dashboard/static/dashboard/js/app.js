/* 
* @Author: archer
* @Date:   2015-08-12 17:52:19
* @Last Modified 2015-09-10
*/

'use strict';

var dashboardApp = angular.module('dashboardApp', [
  'ngRoute',
  'googlechart',
  'dashboardControllers',
]).directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    }
});

dashboardApp.config(['$routeProvider',
  function ($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: '/static/dashboard/partials/dashboard_home.html',
        controller: 'DashboardOverviewCtrl'
      }).
      when('/dashboard_fo', {
        templateUrl: '/static/dashboard/partials/dashboard_fo.html',
        controller: 'DashboardFOOverviewCtrl'
      }).
      when('/dashboard_area', {
        templateUrl: '/static/dashboard/partials/dashboard_area.html',
        controller: 'DashboardAreaOverviewCtrl'
      }).
      when('/data/:data_type', {
        templateUrl: '/static/dashboard/partials/data.html',
        controller: 'DashboardTableCtrl'
      }).
      when('/pivot/:table_type', {
        templateUrl: '/static/dashboard/partials/pivot-table.html',
        controller: 'DashboardPivotCtrl'
      }).
      when('/survey', {
        templateUrl: '/static/dashboard/partials/survey.html',
        controller: 'DashboardSurveyCtrl'
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
        redirectTo: '/'
      });
  }]);
