'use strict';

angular.module('nat').controller('navCtrl', function ($scope) {

    $scope.items = [
    	{
    		fisrtLine : "PRESENTATIONS",
    		secodLine : "& ARTICLES",
            categoryId : "presentations&articles"
    	},
    	{
    		fisrtLine: "COMMERCIAL",
    		secodLine : "WORK",
            categoryId : "comercial-work"
    	},
    	{
    		fisrtLine: "EXPERIMENTAL",
    		secodLine : "PROJECTS",
            categoryId : "expirimental-projects"
    	},
    	{
    		fisrtLine: "ABOUT",
    		secodLine : "ME",
            categoryId : "about-me"
    	}
    ]

});
