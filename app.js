/*global window, console, angular*/
var app = angular.module('startpageApp', []);
app.factory('weatherService', ['$http', '$q',
	function($http, $q) {
		'use strict';
		function getWeather(zipCode) {
			var deferred = $q.defer();
			$http.get('https://query.yahooapis.com/v1/public/yql?q=SELECT%20*%20FROM%20weather.forecast%20WHERE%20location%3D%22' + zipCode + '%22AND%20u=\'c\'&format=json&diagnostics=true&callback=').success(function(data) {
				deferred.resolve(data.query.results.channel);
			}).error(function(err) {
				console.log('Error retrieving markets');
				deferred.reject(err);
			});
			return deferred.promise;
		}
		return {
			getWeather: getWeather
		};
	}
]);
app.controller('weatherController', ['$scope', 'weatherService',
	function($scope, weatherService) {
		'use strict';
		function fetchWeather(zip) {
			weatherService.getWeather(zip).then(function(data) {
				$scope.place = data;
			});
		}
		// We want to get the weather as soon the controller is ready
		fetchWeather('SPXX0165');
		// Add new scope variable that we will attach to a button in the view
		$scope.findWeather = function(zipCode) {
			// Clear info and fetch weather
			$scope.place = '';
			fetchWeather(zipCode);
		};
	}
]);

function timeCtrl($scope, $timeout) {
	'use strict';
	$scope.clock = "loading clock..."; // initialise the time variable
	$scope.tickInterval = 1000; //ms
	var tick = function() {
		$scope.clock = Date.now(); // get the current time
		$timeout(tick, $scope.tickInterval); // reset the timer
	};
	// Start the timer
	$timeout(tick, $scope.tickInterval);
}
