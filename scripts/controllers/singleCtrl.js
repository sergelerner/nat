'use strict';

angular.module('nat').controller('singleCtrl', function ($scope, $routeParams, workServ) {
	
	$scope.singles = workServ.getSingels($routeParams.singleId);	

	$scope.currentSlide = 0;


});
