'use strict';

describe('Service: dataTransform', function () {

  // load the service's module
  beforeEach(module('rangeFinderApp'));

  // instantiate service
  var dataTransform;
  beforeEach(inject(function (_dataTransform_) {
    dataTransform = _dataTransform_;
  }));

  it('should do something', function () {
    expect(!!dataTransform).toBe(true);
  });

});
