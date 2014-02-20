'use strict';

var nat = angular.module('nat', ['ngResource', 'angular-carousel'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/catView.html',
        controller: 'mainCtrl'
      })
      .when('/:categoryId', {
        templateUrl: 'views/catView.html',
        controller: 'categoryCtrl'
      })
       .when('/single/:singleId', {
        templateUrl: 'views/singleView.html',
        controller: 'singleCtrl'
      })
      .when('/about-me', {
        templateUrl: 'views/aboutView.html',
        controller: 'aboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
