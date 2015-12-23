'use strict';

/**
 * @ngdoc service
 * @name rangeFinderApp.helpers
 * @description
 * # helpers
 * Service in the rangeFinderApp.
 */
angular.module('rangeFinderApp')
  .service('helpers', function () {
    this.cleanArray = function (array, deleteValue) {
      for (var i = 0; i < array.length; i++) {
        if (array[i] === deleteValue) {
          array.splice(i, 1);
          i--;
        } else {
          if (array[i].split(':').length < 2) {
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
    };
    this.toRads = function (angle) {
      return angle*0.0174533;
    };
    this.draw = function ($scope, canvas) {
      $scope.ctx.clearRect(0, 0, canvas.width, canvas.height);
      var dotSize = $scope.dotSize || 1;
      if ($scope.data.length > 0) {
        for (var i = 1; i <= $scope.data.length; i++) {
          $scope.ctx.beginPath();
          $scope.ctx.arc(($scope.data[i - 1].x) + $scope.xAdj, ($scope.data[i - 1].y) + $scope.yAdj, dotSize, 0, 2 * Math.PI, false);
          $scope.ctx.fill();
          $scope.ctx.closePath();
        }
        if ($scope.connect) {
          for (var j = 1; j <= $scope.data.length; j++) {
            $scope.ctx.beginPath();
            $scope.ctx.moveTo($scope.data[j - 1].x + $scope.xAdj, $scope.data[j - 1].y + $scope.yAdj);
            if ($scope.data[j]) {
              $scope.ctx.lineTo($scope.data[j].x + $scope.xAdj, $scope.data[j].y + $scope.yAdj);
            }
            $scope.ctx.stroke();
            $scope.ctx.closePath();
          }
        }
      }
      if($scope.center) {
        $scope.ctx.beginPath();
        $scope.ctx.fillStyle = '#FF0000';
        $scope.ctx.arc(($scope.center.x) + $scope.xAdj, ($scope.center.y) + $scope.yAdj, dotSize+1, 0, 2 * Math.PI, false);
        $scope.ctx.fill();
        $scope.ctx.closePath();
      }
    };
    this.matrixMultiply = function (A, B) {
      var rowsA = A.length, colsA = A[0].length,
        rowsB = B.length, colsB = B[0].length,
        C = [];
      if (colsA !== rowsB) {
        return false;
      }
      for (var i = 0; i < rowsA; i++) {
        C[i] = [];
      }
      for (var k = 0; k < colsB; k++) {
        for (i = 0; i < rowsA; i++) {
          var t = 0;
          for (var j = 0; j < rowsB; j++) {
            t += A[i][j] * B[j][k];
            C[i][k] = t;
          }
        }
      }
      return C;
    };

    this.getMassCenter = function (data) {
      var xAccum = 0, yAccum = 0, amount = data.length;
      for(var i = 0; i < amount; i++){
        xAccum += data[i].x;
        yAccum += data[i].y;
      }

      return {
        x: xAccum/amount,
        y: yAccum/amount
      };
    };
    this.getDistance = function (dotA, dotB) {
      var a = dotA.x - dotB.x;
      var b = dotA.y - dotB.y;
      return Math.sqrt( a*a + b*b );
    };

  });
