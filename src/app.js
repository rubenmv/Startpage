/*global window, console, angular*/
// App module
var app = angular.module('startpageApp', [])
	.config([
		'$compileProvider',
		function ($compileProvider) {
			$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome-extension):/);
			$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome-extension):/);
		}],
	'$sceDelegateProvider',
	function ($sceDelegateProvider) {
		$sceDelegateProvider.resourceUrlWhitelist([
			'self',
			'https://api.flickr.com/**'
		]);
	}
	);

// WEATHER SERVICE
// Creates getWeather method
app.factory('weatherFactory', ['$http', '$q',
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
// Weather Controller
app.controller('weatherController', ['$scope', '$timeout', 'weatherFactory',
	function ($scope, $timeout, weatherFactory) {
		'use strict';

		// Fill the scope variable with weather data
		function fillWeatherInfo(weatherData) {
			// Just asign to scope
			$scope.place = weatherData;
			$scope.weatherVisible = true;
		}

		// Ask for weather info and sanitize response
		$scope.fetchWeather = function (location, fullForecast) {
			if (location === null || location === undefined || location === "") {
				return;
			}

			weatherFactory.getWeather(location).then(
				// DEFER SUCCESS
				function (response) { // data is $scope.place 
					var data = null;
					if (response === null || response === undefined) {
						console.log("Cannot retrieve weather, response is null");
						return;
					}
					else {
						data = response.channel;

						if (location !== $scope.location) {
							//$scope.getBackground(location);
						}
						// Store location
						localStorage.setItem('location', location);
						$scope.location = location;
					}
					// Prepare data
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
		// Start the timer
		$timeout(function () {
			document.getElementById("body").style.opacity = 1;
		}, 100);

		// SAVE SETTINGS
		$scope.saveSettings = function (loc, fullFo) {
			if (loc === undefined || loc.trim() === "") {
				return;
			}
			if (fullFo === undefined) {
				fullFo = false;
			}
			localStorage.setItem('fullForecast', fullFo);
			$scope.fullForecast = fullFo;

			$scope.fetchWeather(loc, $scope.fullForecast);
		};
	}
]);

// Background factory http petition
app.factory('flickrFactory', ['$http', '$q',
	function ($http, $q) {
		'use strict';
		// No 'Access-Control-Allow-Origin' header is present on the requested resource.
		/*var flickrFactory = {};

		flickrFactory.getImagesByTags = function (_params) {
			var searchData = flickrSearchDataService.getNew("imagesByTags", _params);
			return $http({
				method: 'JSONP',
				url: searchData.url,
				params: searchData.object
			});
		};

		return flickrFactory;*/

		function getImagesByTags(options) {
			var deferred = $q.defer(),
				url = "https://api.flickr.com/services/feeds/photos_public.gne?format=json&jsoncallback=angular.callbacks._0&tagmode=" + options.tagmode + "&tags=" + options.tags;

			$http({
				method: 'JSONP',
				url: url,
				params: [{
					format: "jsonp",
					jsoncallback: 'JSON_CALLBACK'
				}]
			})
				.success(function (data) {
					deferred.resolve(data);
				})
				.error(function (err) {
					console.log('Error retrieving flickr data: ' + err);
					deferred.reject(err);
				});
			return deferred.promise;
		}
		return {
			getImagesByTags: getImagesByTags
		};
	}]);

// Controller for background image
app.controller('backgroundController', ['$scope', '$timeout', 'flickrFactory',
	function ($scope, $timeout, flickrFactory) {
		'use strict';
		// Fetch background
		$scope.getBackground = function (location) {
			flickrFactory.getImagesByTags({ tags: location, tagmode: "any" })
				.then(function (data) { // success
					// Find images with location tag
					var items = data.items;
					if (items.length > 0) {
						// Pick a random image
						var rand = Math.floor(Math.random() * items.length);
						// Select "big" resolution and set background image
						var bg = items[rand].media.m.replace("_m", "_b");
						document.body.style.background = 'url(' + bg + ') no-repeat center center fixed';
						document.body.style.backgroundSize = 'cover'; // Fill body, keep res
					}
				})
				.catch(function (data) { // error
					console.error("Error retrieving images from Flickr: " + JSON.stringify(data));
				});
		}
		// Get location
		$scope.location = localStorage.getItem('location');
		if ($scope.location === null) {
			$scope.location = "Madrid, Spain";
			localStorage.setItem("location", $scope.location);
		}
		else if ($scope.location === undefined || $scope.location.trim() === "") {
			$scope.location = "Madrid, Spain"; // Set default
			localStorage.setItem("location", $scope.location);
		}

		$scope.getBackground($scope.location);
	}
]);
// TIME DATE CONTROLLER
// Controller for time and date
app.controller('timeController', ['$scope', '$timeout',
	function ($scope, $timeout) {
		'use strict';
		$scope.clock = Date.now(); // initialise the time variable
		$scope.tickInterval = 1000; //ms
		// Start the timer
		var tick = function () {
			$scope.clock = Date.now(); // get the current time
			$timeout(tick, $scope.tickInterval); // reset the timer
		};

		$timeout(tick, $scope.tickInterval);
	}
]);

