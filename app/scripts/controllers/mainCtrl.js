'use strict';

angular.module('nat').controller('mainCtrl', function ($scope, workServ) {

	$scope.works = workServ.getCategories('selected-work');	

});