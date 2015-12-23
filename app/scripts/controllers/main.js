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
  $scope.transformed = false;
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
    originData = data;
    $scope.dataNotLoaded = false;
    $scope.data = transformedDots = dataTransform.toRobotCoords(data, $scope.rangeFinderPosMatrix);
    $scope.center = helpers.getMassCenter(transformedDots);
    helpers.drawCenterCircle($scope.center, transformedDots, $scope.xAdj, $scope.yAdj, $scope.ctx);
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
