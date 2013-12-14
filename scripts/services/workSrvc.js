'use strict';

angular.module('nat').factory("workServ", function($http, $q) {

	return {
		getCategories : function(workId) {			

			var deferred = $q.defer();			

			$http.get('data/'+ workId +'.json').
				success(function (data, status, header, config) {										
					deferred.resolve(data);
				}).
				error(function (data, status, header, config){
					deferred.reject(status);
				});

			return deferred.promise;	
		},
		getSingels : function(workId) {			

			var deferred = $q.defer();			

			$http.get('data/single/'+ workId +'.json').
				success(function (data, status, header, config) {										
					deferred.resolve(data);
				}).
				error(function (data, status, header, config){
					deferred.reject(status);
				});

			return deferred.promise;	
		},
	};
});
