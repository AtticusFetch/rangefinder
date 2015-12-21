'use strict';

/**
 * @ngdoc overview
 * @name rangeFinderApp
 * @description
 * # rangeFinderApp
 *
 * Main module of the application.
 */
angular
  .module('rangeFinderApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
