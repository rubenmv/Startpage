/*global window, console, angular*/
var app = angular.module('startpageApp', []);
app.factory('weatherService', ['$http', '$q',
	function ($http, $q) {
		'use strict';

		function getWeather(location) {
			console.log(location);
			var deferred = $q.defer(),
				yql = "select * from weather.forecast where woeid in (select woeid from geo.places(1) where text='" + location + "') and u='c'",
				query = "https://query.yahooapis.com/v1/public/yql?q=" + yql + "&format=json&env=store://datatables.org/Falltableswithkeys";

			$http.get(query).success(function (data) {
				deferred.resolve(data.query.results.channel);
			}).error(function (err) {
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
	function ($scope, weatherService) {
		'use strict';

		function fetchWeather(location) {
			localStorage.setItem('location', location);
			weatherService.getWeather(location).then(function (data) {
				$scope.place = data;
				// Fix 0-9 leading 0 to match images
				var codes = $scope.place.item.condition.code;
				if (parseInt($scope.place.item.condition.code) < 10) {
					code = "0" + code;
				}
				codes = $scope.place.item.forecast;
				for (var i = 0; i < codes.length; i++) {
					if (codes[i].code < 10) {
						codes[i].code = "0" + codes[i].code;
					}
				}
			});
		}
		// We want to get the weather as soon the controller is ready
		var location = localStorage.getItem('location');
		if (location === null) {
			location = 'Madrid, Spain'; // Default location
		}
		fetchWeather(location);
		// Add new scope variable that we will attach to a button in the view
		$scope.findWeather = function (location) {
			// Clear info and fetch weather
			$scope.place = '';
			fetchWeather(location);
		};
	}
]);

function timeCtrl($scope, $timeout) {
	'use strict';
	$scope.clock = "loading clock..."; // initialise the time variable
	$scope.tickInterval = 1000; //ms
	var tick = function () {
		$scope.clock = Date.now(); // get the current time
		$timeout(tick, $scope.tickInterval); // reset the timer
	};
	// Start the timer
	$timeout(tick, $scope.tickInterval);
}