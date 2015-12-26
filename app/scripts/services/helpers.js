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
      return angle * 0.0174533;
    };
    this.draw = function ($scope, canvas) {
      $scope.ctx.clearRect(0, 0, canvas.width, canvas.height);
      var dotSize = $scope.dotSize || 1;
      if ($scope.data.length > 0) {
        for (var i = 0; i < $scope.data.length; i++) {
          $scope.ctx.beginPath();
          $scope.ctx.arc(($scope.data[i].x) + $scope.xAdj, ($scope.data[i].y) + $scope.yAdj, dotSize, 0, 2 * Math.PI, false);
          $scope.ctx.fill();
          $scope.ctx.closePath();
        }
        if ($scope.connect) {
          for (var j = 1; j <= $scope.data.length; j++) {
            $scope.ctx.beginPath();
            $scope.ctx.fillStyle = '#FF0000';
            $scope.ctx.lineWidth = 2;
            $scope.ctx.moveTo($scope.data[j - 1].x + $scope.xAdj, $scope.data[j - 1].y + $scope.yAdj);
            if ($scope.data[j]) {
              $scope.ctx.lineTo($scope.data[j].x + $scope.xAdj, $scope.data[j].y + $scope.yAdj);
            } else {
              $scope.ctx.lineTo($scope.data[0].x + $scope.xAdj, $scope.data[0].y + $scope.yAdj);
            }
            $scope.ctx.stroke();
            $scope.ctx.closePath();
            $scope.ctx.fillStyle = '#000000';
          }
        }
      }
      if ($scope.center) {
        $scope.ctx.beginPath();
        $scope.ctx.fillStyle = '#FF0000';
        $scope.ctx.arc(($scope.center.x) + $scope.xAdj, ($scope.center.y) + $scope.yAdj, dotSize + 1, 0, 2 * Math.PI, false);
        $scope.ctx.fill();
        $scope.ctx.closePath();
        $scope.ctx.fillStyle = '#000000';
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
      for (var i = 0; i < amount; i++) {
        xAccum += data[i].x;
        yAccum += data[i].y;
      }

      return {
        x: xAccum / amount,
        y: yAccum / amount
      };
    };

    this.isNear = function (xC, yC, r, x, y) {
      return ((x - xC)*(x - xC) + (y - yC)*(y - yC) <= r*r);
    };

    this.distanceSort = function (data, gap) {
      var changed = true, i, j;
      while(changed) {
        changed = false;
        for (i = 0; i < data.length; i++) {
          var pCount = 0;
          for (j = 0; j < data.length; j++) {
            if(i !== j) {
              if(this.isNear(data[i].x, data[i].y, gap, data[j].x, data[j].y)) {
                pCount++;
              }
            }
          }
          if(pCount < 4) {
            data.splice(i, 1);
            changed = true;
          }
        }
      }
      var nextInd;
      for (i = 0; i < data.length; i++) {
        var minDist = 1000000, index;
        for (j = i+1; j < data.length; j++) {
          var dist = this.getDistance(data[i], data[j]);
          if(dist < minDist) {
            minDist = dist;
            //console.log(minDist);
            index = j;
          }
        }
        if(angular.isDefined(index) && angular.isDefined(data[i+1]) && ((i+1) !== index)) {
          nextInd = i+1;
          var tmp = {};
          //console.log('before');
          //console.log(data[nextInd]);
          //console.log(data[index]);
          //console.log(nextInd);
          //console.log(index);
          //console.log('------------');
          angular.merge(tmp, data[nextInd]);
          angular.merge(data[nextInd], data[index]);
          angular.merge(data[index], tmp);
          //console.log('after');
          //console.log(data[nextInd]);
          //console.log(data[index]);
          //console.log('------------');
        }
      }
      return data;
    };

    this.clearLags = function (data, gap) {
      //data = this.distanceSort(data);
      for (var i = 0; i < data.length; i++) {
        var next = data[i+1] ? data[i+1] : data[0];
        var prev = data[i-1] ? data[i-1] : data[data.length - 1];
        if(this.getDistance(data[i], prev) > gap || this.getDistance(data[i], next) > gap) {
          data.splice(i,1);
        }
      }
      return data;
    };

    this.expFilter = function (data) {
      for (var i = 1; i < data.length; i++) {
        var nextIndex = data[i+1] ? i+1 : 0;
        var prevIndex = data[i-1] ? i-1 : data.length - 1;
        var avgX = (data[i].x + data[prevIndex].x + data[nextIndex].x)/3;
        var avgY = (data[i].y + data[prevIndex].y + data[nextIndex].y)/3;
        data[i].x = avgX;
        data[i].y = avgY;
        data.splice(prevIndex,1);
        data.splice(nextIndex,1);

      }
      return data;
    };

    this.medianneFilter = function (data) {
      for (var i = 1; i < data.length; i++) {
        var nextIndex = data[i+1] ? i+1 : 0;
        var prevIndex = data[i-1] ? i-1 : data.length - 1;
        var avgX = (data[i].x + data[prevIndex].x + data[nextIndex].x)/3;
        var avgY = (data[i].y + data[prevIndex].y + data[nextIndex].y)/3;
        data[i].x = avgX;
        data[i].y = avgY;
      }
      return data;
    };

    this.distExpFilter = function (data) {
        for(var i = 0; i < data.length; i++) {
          var nextIndex = data[i+1] ? i+1 : 0;
          var prevIndex = data[i-1] ? i-1 : data.length - 1;
          data[i].dist = (data[prevIndex].dist + data[i].dist + data[nextIndex].dist)/3;
        }
      return data;
    };

    this.getDistance = function (dotA, dotB) {
      var a = dotB.x - dotA.x;
      var b = dotB.y - dotA.y;
      return Math.sqrt(a * a + b * b);
    };

  });
