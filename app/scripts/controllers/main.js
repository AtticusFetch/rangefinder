'use strict';

/**
 * @ngdoc function
 * @name rangeFinderApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the rangeFinderApp
 */
function MainCtrl($scope, dataTransform, helpers) {
  var canvas = document.getElementById('room');
  $scope.dataNotLoaded = true;
  $scope.width = canvas.getAttribute('width');
  $scope.height = canvas.getAttribute('height');
  $scope.ctx = canvas.getContext('2d');
  $scope.data = [];
  $scope.isRightRangeFinder = true;
  $scope.directionParam = $scope.isRightRangeFinder ? 1 : -1;
  $scope.transformed = false;
  $scope.noLags = false;
  var dots = [],
    originData = [],
    transformedDots = [];
  $scope.centerScale = 100;
  $scope.drawingScale = 3;
  $scope.dotSize = 2;
  $scope.connect = false;
  $scope.rangeFinderPosMatrix = [];
  $scope.xAdj = -150;
  $scope.yAdj = -300;
  $scope.gap = 50;

  for (var i = 0; i < 4; i++) {
    $scope.rangeFinderPosMatrix[i] = [];
    for (var j = 0; j < 4; j++) {
      $scope.rangeFinderPosMatrix[i][j] = 0;
    }
  }

  $scope.rangeFinderPosMatrix = [
    [0, 1, 0, -65.0],
    [-1, 0, 0, -223.0],
    [0, 0, 1, 265.5],
    [0, 0, 0, 1]
  ];

  function doTransform() {
    if (!$scope.transformed) {
      $scope.data = dataTransform.toRobotCoords($scope.data, $scope.rangeFinderPosMatrix);
      $scope.transformed = true;
    }
  }

  function doFilter() {
      doTransform();
      $scope.data = helpers.clearLags($scope.data, $scope.gap);
      reDraw();
  }

  function doSort() {
    $scope.data = helpers.distanceSort($scope.data, $scope.gap);
    reDraw();
  }

  function doExpFilter() {
    $scope.data = helpers.expFilter($scope.data);
    reDraw();
  }

  function doDistExpFilter() {
    $scope.data = helpers.distExpFilter($scope.data);
  }

  function medianneFilter() {
    $scope.data = helpers.medianneFilter($scope.data);
    reDraw();
  }

  function updatePositionMatrix() {
    $scope.data = dataTransform.toRobotCoords($scope.data, $scope.rangeFinderPosMatrix);
    reDraw();
  }

  $scope.doTransform = doTransform;
  $scope.doFilter = doFilter;
  $scope.doSort = doSort;
  $scope.doExpFilter = doExpFilter;
  $scope.doDistExpFilter = doDistExpFilter;
  $scope.medianneFilter = medianneFilter;
  $scope.updatePositionMatrix = updatePositionMatrix;

  function Measurement(time, x, y, ang, dist) {
    this.time = time || null;
    this.x = x || null;
    this.y = y || null;
    this.ang = ang || null;
    this.dist = dist || null;
  }

  $scope.showContent = function ($fileContent) {
    var content = helpers.cleanArray($fileContent.split(' '), '');
    var data = [];
    for (var i = 0; i < content.length; i++) {
      if (typeof content[i] === 'object') {
        data.push(new Measurement(content[i], content[i + 1], content[i + 2], content[i + 3], content[i + 4]));
      }
    }
    //originData = data;
    $scope.dataNotLoaded = false;
    $scope.data = originData = data;
    //$scope.data = transformedDots = dataTransform.toRobotCoords(data, $scope.rangeFinderPosMatrix);
    $scope.center = helpers.getMassCenter(transformedDots);
  };
  function reDraw() {
    helpers.draw($scope, canvas, dots);
  }

  $scope.$watch('data', reDraw);
  $scope.$watch('dotSize', reDraw);
  $scope.$watch('connect', reDraw);
  $scope.$watch('centerScale', reDraw);
  $scope.$watch('drawingScale', reDraw);
  $scope.$watch('xAdj', reDraw);
  $scope.$watch('yAdj', reDraw);
  $scope.$watch('transformed', reDraw);
  $scope.$watch('noLags', reDraw);
}
angular.module('rangeFinderApp')
  .controller('MainCtrl', ['$scope', 'dataTransform', 'helpers', MainCtrl])
  .directive('onReadFile', function ($parse) {
    return {
      restrict: 'A',
      scope: false,
      link: function (scope, element, attrs) {
        var fn = $parse(attrs.onReadFile);

        element.on('change', function (onChangeEvent) {
          var reader = new FileReader();

          reader.onload = function (onLoadEvent) {
            scope.$apply(function () {
              fn(scope, {$fileContent: onLoadEvent.target.result});
            });
          };

          reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
        });
      }
    };
  });
