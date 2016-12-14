/*global window, console, angular*/

var app = angular.module('startpageApp', ['ngAnimate'])
	.config([
		'$compileProvider',
		function ($compileProvider) {
			$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome-extension):/);
			$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome-extension):/);
		}
	]);
app.factory('weatherService', ['$http', '$q',
	function ($http, $q) {
		'use strict';
		function getWeather(location) {
			var deferred = $q.defer(),
				yql = "select * from weather.forecast where woeid in (select woeid from geo.places(1) where text='" + location + "') and u='c'",
				query = "https://query.yahooapis.com/v1/public/yql?q=" + yql + "&format=json&env=store://datatables.org/Falltableswithkeys";

			$http.get(query).success(function (data) {
				deferred.resolve(data.query.results);
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
app.controller('weatherController', ['$scope', '$timeout', 'weatherService',
	function ($scope, $timeout, weatherService) {
		'use strict';

		// Fill the scope variable with weather data
		function fillWeatherInfo(weatherData) {
			// Just asign to scope
			$scope.place = weatherData;
			$scope.weatherVisible = true;
		}

		// Ask for weather info and sanitize response
		$scope.fetchWeather = function (location, fullForecast) {
			console.log("retrieving weather");
			if (location === null || location === undefined || location === "") {
				return;
			}

			weatherService.getWeather(location).then(
				// DEFER SUCCESS
				function (response) { // data is $scope.place 
					var data = null;
					if (response === null || response === undefined) {
						console.log("Cannot retrieve weather, response is null");
						return;
					}
					else {
						data = response.channel;
					}
					// Prepare data
					//$scope.place = data;
					// Fix 0-9 leading 0 to match images
					var cod = data.item.condition.code;
					if (parseInt(cod) < 10) {
						cod = "0" + cod;
					}
					data.item.condition.code = cod;
					// Also for forecast
					if (fullForecast) {
						cod = data.item.forecast;
					}
					else {
						cod = data.item.forecast.slice(0, 5);
					}
					for (var i = 0; i < cod.length; i++) {
						if (cod[i].code < 10) {
							cod[i].code = "0" + cod[i].code;
						}
					}
					data.item.forecast = cod;
					localStorage.setItem('weatherData', JSON.stringify(data));
					fillWeatherInfo(data);
				},
				// DEFER FAILED
				function (reason) {
					console.error("getWeather deferred promise reject: " + reason);
				});
		}
		// !-- fetchWeather --

		// INITIALIZE
		// Scope variable for ng-show property in #weather div
		$scope.weatherVisible = false;

		$scope.location = localStorage.getItem('location');
		if ($scope.location === null) {
			$scope.location = "Madrid, Spain";
			localStorage.setItem("location", $scope.location);
		}
		else if ($scope.location === undefined || $scope.location.trim() === "") {
			$scope.location = "Madrid, Spain"; // Set default
			localStorage.setItem("location", $scope.location);
		}
		$scope.fullForecast = localStorage.getItem('fullForecast');
		if ($scope.fullForecast === null || $scope.fullForecast === undefined) {
			$scope.fullForecast = false; // Set default
			localStorage.setItem("fullForecast", false);
		}
		$scope.fullForecast = ($scope.fullForecast == "true"); // To Boolean
		var weatherData = localStorage.getItem('weatherData');
		// Fill previous weather data before trying to fetch new info
		if (weatherData !== null && weatherData !== undefined) {
			weatherData = JSON.parse(weatherData);
			fillWeatherInfo(weatherData);
		}
		document.getElementById("full_forecast").checked = $scope.fullForecast;

		// Fetch weather info
		$scope.fetchWeather($scope.location, $scope.fullForecast);

		// Show page content after few milliseconds
		// enough to let controllers to initialize data
		document.getElementById("body").style.opacity = 1;


		// SAVE SETTINGS
		$scope.saveSettings = function (loc, fullFo) {
			if (loc !== undefined && loc.trim() !== "") {
				localStorage.setItem('location', loc);
				$scope.location = loc;
			}
			if (fullFo === undefined) {
				fullFo = false;
			}
			localStorage.setItem('fullForecast', fullFo);
			$scope.fullForecast = fullFo;

			$scope.fetchWeather($scope.location, $scope.fullForecast);
		};
	}
]);

function timeCtrl($scope, $timeout) {
	'use strict';
	$scope.clock = Date.now(); // initialise the time variable
	$scope.tickInterval = 1000; //ms
	var tick = function () {
		$scope.clock = Date.now(); // get the current time
		$timeout(tick, $scope.tickInterval); // reset the timer
	};
	// Start the timer
	$timeout(tick, $scope.tickInterval);
}