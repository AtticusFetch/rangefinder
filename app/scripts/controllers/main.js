'use strict';

/**
 * @ngdoc function
 * @name rangeFinderApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the rangeFinderApp
 */
angular.module('rangeFinderApp')
  .controller('MainCtrl', function ($scope) {
    $scope.data = [];
    function Measurement (time, x, y, ang, dist) {
      this.time = time || '';
      this.x = x || '';
      this.y = y || '';
      this.ang = ang || '';
      this.dist = dist || '';
    }
    function cleanArray (array, deleteValue) {
      for (var i = 0; i < array.length; i++) {
        if (array[i] === deleteValue) {
          array.splice(i, 1);
          i--;
        } else {
          if(array[i].split(':').length < 2) {
            array[i] = parseFloat(array[i].trim());
          } else {
            var date = new Date();
            var timeVals = array[i].split(':');
            date.setHours(parseInt(timeVals[0]));
            date.setMinutes(parseInt(timeVals[1]));
            date.setSeconds(parseInt(timeVals[2]));
            array[i] = date;
          }
        }
      }
      return array;
    }
    $scope.showContent = function($fileContent){
      var content = cleanArray($fileContent.split(' '), '');
      var data = [];
      for(var i = 0; i < content.length; i++) {
        if(typeof content[i] === 'object') {
          data.push(new Measurement(content[i], content[i + 1], content[i + 2], content[i + 3], content[i + 4]));
        }
      }
      $scope.data = data;
    };

    var canvas = document.getElementById('room');
    var width = canvas.getAttribute('width');
    var height = canvas.getAttribute('height');
    $scope.ctx = canvas.getContext('2d');

    function draw () {
      if($scope.data.length > 0) {
        for(var i = 1; i <= $scope.data.length; i++) {
          var B = {
            x: $scope.data[i - 1].x/5 + width/3,
            y: $scope.data[i - 1].y/5 + height/3
          };
          var A = {
            x: $scope.data[i].x/5 + width/3,
            y: $scope.data[i].y/5 + height/3
          };
          var ABx = B.x - A.x;
          var ABy = B.y - A.y;
          var ABLength = Math.sqrt(ABx * ABx + ABy * ABy);
          // normalized vector AB
          var NABx = ABx / ABLength;
          var NABy = ABy / ABLength;
          // Perpendicular + normalized vector.
          var PNAB = {x: -NABy,
            y: NABx
          };
          // compute D = A + l * PNAB
          PNAB.x = A.x + $scope.data[i-1].dist/5 * PNAB.x;
          PNAB.y = A.y + $scope.data[i-1].dist/5 *PNAB.y;
          $scope.ctx.beginPath();
          $scope.ctx.moveTo($scope.data[i - 1].x/5 + width/3, $scope.data[i - 1].y/5 + height/3);
          $scope.ctx.lineTo(PNAB.x, PNAB.y);
          $scope.ctx.moveTo($scope.data[i - 1].x/5 + width/3, $scope.data[i - 1].y/5 + height/3);
          $scope.ctx.lineTo($scope.data[i].x/5 + width/3, $scope.data[i].y/5 + height/3);
          $scope.ctx.stroke();
          $scope.ctx.closePath();
        }
      }
    }
    $scope.$watch('data', draw);
  })
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
