'use strict';

angular.module('nat').controller('categoryCtrl', function ($scope, $routeParams, workServ) {

	$scope.works = workServ.getCategories($routeParams.categoryId);	
	
});