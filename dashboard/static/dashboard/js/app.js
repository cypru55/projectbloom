/* 
* @Author: archer
* @Date:   2015-08-12 17:52:19
* @Last Modified 2015-09-22
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
                    scope.$emit('ngRepeatFinished', attr);
                });
            }
        }
    }
});

dashboardApp.config(['$routeProvider',
  function ($routeProvider) {
    $routeProvider.
      when('/dashboard_monthly/:tab', {
        templateUrl: '/static/dashboard/partials/dashboard_monthly.html',
        controller: 'DashboardMonthlyCtrl'
      }).
      when('/dashboard_shareout', {
        templateUrl: '/static/dashboard/partials/dashboard_shareout.html',
        controller: 'DashboardShareoutCtrl'
      }).
      when('/dashboard_quaterly', {
        templateUrl: '/static/dashboard/partials/dashboard_quaterly.html',
        controller: 'DashboardQuaterlyCtrl'
      }).
      when('/mtd_recruitment_chart', {
        templateUrl: '/static/dashboard/partials/mtd_recruitment.html',
        controller: 'DashboardRecruitmentMTDCtrl'
      }).
      when('/op_report', {
        templateUrl: '/static/dashboard/partials/operation_report.html',
        controller: 'DashboardOpReportCtrl'
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
        redirectTo: '/dashboard_monthly/kpi'
      });
  }]);
