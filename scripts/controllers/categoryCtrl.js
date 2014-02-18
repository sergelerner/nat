'use strict';

angular.module('nat').controller('categoryCtrl', function ($scope, $routeParams, workServ) {

	$scope.works = workServ.getCategories($routeParams.categoryId);


	console.log('categoryCtrl');
	$(window).scrollTop(500,200);

});