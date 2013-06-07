(function() {

	// --------------------------
	// Constructor Section
	function MapTrouveTout() {
		
		// enforce use of 'new'
		if (!(this instanceof MapTrouveTout)) {
			return new MapTrouveTout();
		}
		return this;
	}
	// /End/ Constructor Section
	// --------------------------

	// -------------
	// PUBLIC
	MapTrouveTout.prototype = {
		"buildGame" : (function($elem) {
			pageDomHandler.init($elem);
			panoramaHandler.init(pageDomHandler.getPanorama());
			guessMapHandler.init(pageDomHandler.getMapCanvas());
		})
	};
	// /End/ PUBLIC
	// -------------

	// Expose mapTrouveTout as a library in general context
	window.mapTrouveTout = MapTrouveTout();

	// Expose MapTrouveTout as a "nameSpace"
	
	// --------------
	// PRIVATE
	// /End/ PRIVATE
	// -------------

	function PageDomHandler() {
		var self = this;

		var $playingGeneralArea;
		var $panoramaNode;
		var $resetViewNode;
		var $guessPaneNode;
		var $goGuessNode;
		var $guessMapNode;
		var $showResultMapWrapper;
		var $showResultMapNode;
		var $showResultDistanceNode;
		var $retryNode;

		this.init = (function($elem) { // $elem : pageDomHandler.getPanorama()

			buildNodes($elem);

			linkNodes();

			interationSetup();
		});

		self.getPanorama = (function() {
			return $panoramaNode;
		});
		self.getMapCanvas = (function() {
			return $guessMapNode;
		});

		self.getResultMap = (function() {
			return $showResultMapNode;
		});
		self.getResultWrapper = (function() {
			return $showResultMapWrapper;
		});

		self.getResultLabel = (function() {
			return $showResultDistanceNode;
		});

		function makeClassedNode(type, text, clazz) {
			var $node = jQuery("<" + type + ">" + text + "</" + type + ">");
			$node.addClass(clazz);
			return $node;
		}

		function buildNodes($elem) {
			$playingGeneralArea = $elem;

			$playingGeneralArea.addClass("mapTrouveTout");

			$panoramaNode = makeClassedNode("div", "", "panorama");
			$panoramaNode.addClass("full");

			$guessPaneWrapper = makeClassedNode("div", "", "guess-pane-wrapper");

			$guessPaneTirette = makeClassedNode("div", "Hide / Show", "tirette");

			$guessPaneNode = makeClassedNode("div", "", "guess-pane");
			$guessPaneNode.addClass("full");

			$resetViewNode = makeClassedNode("div",
					"Go back to start Location", "reset-view");
			$goGuessNode = makeClassedNode("div", "Make a guess", "go-guess");
			$resetViewNode.add($goGuessNode).addClass("button").addClass(
					"swimmer");

			$guessMapNode = makeClassedNode("div", "", "guess-map");
			$showResultMapWrapper = makeClassedNode("div", "", "result-wrapper");
			$showResultMapNode = makeClassedNode("div", "", "result-map");
			$guessMapNode.add($showResultMapNode).addClass("map").addClass(
					"full");
			$guessMapNode.addClass("full");

			$showResultDistanceNode = makeClassedNode("div", "",
					"result-distance");
			$retryNode = makeClassedNode("div", "Retry ?", "result-retry");
			$showResultDistanceNode.add($retryNode).addClass("swimmer");
			$retryNode.addClass("button");

		}

		function linkNodes() {
			$playingGeneralArea.append($panoramaNode);
			$playingGeneralArea.append($guessPaneWrapper);
			$playingGeneralArea.append($showResultMapWrapper);

			$guessPaneWrapper.append($guessPaneTirette);
			$guessPaneWrapper.append($guessPaneNode);
			$guessPaneNode.append($resetViewNode);
			$guessPaneNode.append($goGuessNode);
			$guessPaneNode.append($guessMapNode);

			$showResultMapWrapper.append($showResultMapNode);
			$showResultMapWrapper.append($showResultDistanceNode);
			$showResultMapWrapper.append($retryNode);

		}

		function interationSetup() {

			$guessPaneTirette.click(function() {
				$guessPaneNode.slideToggle();
			});

			$resetViewNode.click(panoramaHandler.resetView);

			$goGuessNode.click(resultMapHandler.init);

			$retryNode.click(window.location.reload);
		}

	}

	var pageDomHandler = new PageDomHandler();

	function PanoramaHandler() {
		var self = this;

		var panorama;

		var startPov = {
			heading : 0, // heads north
			pitch : 0
		// tilt horizontally
		};
		var startPos;
		// makes a StartPosition, see according function
		// this relies on a callBack from async function
		makeStartPosition();

		var startPanoramaOptions = {
			zoomControlOptions : {
				style : google.maps.ZoomControlStyle.SMALL
			},
			linksControl : true, // show roadlinks (their text will be
			// hidden)
			addressControl : false, // do NOT give the current adress ... would
			// kill the game doesn't it ?
			visible : true
		// panorama is visible
		};

		this.init = (function($elem) { // $elem : pageDomHandler.getPanorama()
			panorama = new google.maps.StreetViewPanorama($elem.get(0),
					startPanoramaOptions);
			self.resetView();

			// see appropriate function
			google.maps.event.addListener(panorama, 'links_changed',
					linksUpdater);
		});

		this.resetView = (function() {
			if (panorama) {
				panorama.set("pov", startPov);
				panorama.setPosition(startPos);
			}
			// console.log(startPos+" >" );
		});

		this.getSolution = (function() {
			// original code : return new google.maps.LatLng(startPos)
			// check if this works ... Do they have a copy constructor ?
			// I am too lazy to check documentation which is in a browser tab 2
			// clicks away
			// I'd rather write this overly long comment than check it.
			return new google.maps.LatLng(startPos.lat(), startPos.lng());
			// turns out : they don't :(
		});

		// --------------
		// PRIVATE

		// No Links On the road (it is a cheat !)
		var linksUpdater = (function() {
			var links = panorama.getLinks();
			for ( var i in links) {
				links[i].description = "";
			}
		});

		var svService = new google.maps.StreetViewService();

		function makeStartPosition() {
			// TODO: This is still a draft with static point located somewhere
			// in the US ... Berkeley ... CrossRoad between Bancroft Way and
			// College Avenue ...
			// return new google.maps.LatLng(37.869085, -122.254775);
			// var berkeleyBancroft = new google.maps.LatLng(37.869085,
			// -122.254775);

			var randLatLng = selectiveRandom();

			var svService = new google.maps.StreetViewService();

			getClosestPosition(randLatLng, 100, svService);
		}

//		function bruteForceRandom(){
//			var randLat = Math.random() * 180 - 90;
//			var randLong = Math.random() * 360 - 180;
//
//			return new google.maps.LatLng(randLat, randLong);
//		}
		
		function getClosestPosition(latLng, seekerDist, svService) {
			svService
					.getPanoramaByLocation(
							latLng,
							seekerDist,
							function(result, status) {
								if (status == google.maps.StreetViewStatus.OK) {
									startPos = result.location.latLng;
									self.resetView();
								} else {
									if (seekerDist < (10 * 1000 * 1000 * 1000)) {
										getClosestPosition(latLng,
												seekerDist * 10, svService);
									} else {
										console
												.log("No street view is available within "
														+ seekerDist
														+ " meters");
										startPos = new google.maps.LatLng(
												37.869085, -122.254775);
										self.resetView();
									}
								}
							});
		}

		// /End/ PRIVATE
		// -------------
	}

	var panoramaHandler = new PanoramaHandler();

	function GuessMapHandler() {
		var self = this;

		var mapStartCenterLatLng = new google.maps.LatLng(45.75207358153858,
				4.830398261547089);
		var marker;
		var map;

		var mapOptions = {
			zoom : 2,
			mapTypeId : google.maps.MapTypeId.ROADMAP,
			center : mapStartCenterLatLng,
			mapTypeControl : false,
			streetViewControl : false
		};

		this.init = (function($elem) { // $elem : pageDomHandler.getMapCanvas()
			map = new google.maps.Map($elem.get(0), mapOptions);

			marker = new google.maps.Marker({
				map : map,
				draggable : true,
				animation : google.maps.Animation.DROP,
				position : mapStartCenterLatLng
			});

			google.maps.event.addListener(map, 'click', function(e) {
				marker.setPosition(e.latLng);
			});

		});

		this.getGuess = (function() {
			return new google.maps.LatLng(marker.getPosition().lat(), marker
					.getPosition().lng());
		});

	}

	var guessMapHandler = new GuessMapHandler();

	function ResultMapHandler() {
		var self = this;

		this.init = (function() {

			pageDomHandler.getResultWrapper().show();

			var actualSolution = panoramaHandler.getSolution();
			var playerProposition = guessMapHandler.getGuess();

			var bounds = new google.maps.LatLngBounds();
			bounds.extend(actualSolution);
			bounds.extend(playerProposition);

			var mapOptions = {
				mapTypeId : google.maps.MapTypeId.ROADMAP,
				// center : mapStartCenterLatLng,
				mapTypeControl : false,
				streetViewControl : false
			};

			var map = new google.maps.Map(pageDomHandler.getResultMap().get(0),
					mapOptions);

			// Fit these bounds to the map
			map.fitBounds(bounds);

			var targetMarker = new google.maps.Marker({
				map : map,
				draggable : false,
				// draggable : true,
				// animation : google.maps.Animation.DROP,
				icon : 'img/markers/target.png',
				shadow : 'img/markers/target-shadow.png',
				position : actualSolution
			});
			new google.maps.Marker({
				map : map,
				draggable : false,
				position : playerProposition
			});

			var geodesicPoly;

			var geodesicOptions = {
				strokeColor : '#CC0099',
				strokeOpacity : 1.0,
				strokeWeight : 3,
				geodesic : true,
				map : map,
				path : [ actualSolution, playerProposition ]
			};
			geodesicPoly = new google.maps.Polyline(geodesicOptions);

			var dist = google.maps.geometry.spherical.computeDistanceBetween(
					actualSolution, playerProposition);

			pageDomHandler.getResultLabel().html(
					Math.floor(dist) / 1000 + " km");

			
			if(window["coordinateWizzardIncluded"]){
				coordinateWizzard(map,targetMarker);
			}
			
		});

	}

	var resultMapHandler = new ResultMapHandler();

	// /End/ PRIVATE
	// --------------

})();
