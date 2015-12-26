'use strict';

/**
 * @ngdoc service
 * @name rangeFinderApp.dataTransform
 * @description
 * # dataTransform
 * Service in the rangeFinderApp.
 */
angular.module('rangeFinderApp')
  .service('dataTransform', ['helpers', function (helpers) {
    this.toRobotCoords = function (data, rangeFinderPosMatrix) {
      for(var i = 0; i < data.length; i++) {
        var newCoors = helpers.matrixMultiply(rangeFinderPosMatrix, [[data[i].dist], [0], [0], [1]]);
        var wcsMatrix = [
          [Math.cos(helpers.toRads(data[i].ang)), Math.cos(helpers.toRads(90 + data[i].ang)), 0, data[i].x],
          [Math.cos(helpers.toRads(90 - data[i].ang)), Math.cos(helpers.toRads(data[i].ang)), 0, data[i].y],
          [0, 0, 1, 0],
          [0, 0, 0, 1]
        ];
        var wcsCoordinates = helpers.matrixMultiply(wcsMatrix, newCoors);
        data[i].x = wcsCoordinates[0][0];
        data[i].y = wcsCoordinates[1][0];
      }
      return data;
    };
    this.medianneFilter = function (gap, data) {
      for(var i = 0; i < data.length; i += gap) {
        var xDiff = data[i].x, yDiff = data[i].y;
        for(var j = i; j < gap; j++) {
          xDiff += Math.abs(xDiff - data[j].x);
          yDiff += Math.abs(yDiff - data[j].y);
        }
        console.log('xDiff: ');
        console.log(xDiff);
        console.log('yDiff: ');
        console.log(yDiff);
      }
    };
  }]);
