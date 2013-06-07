(function() {
	var rectList = [];

	function makeSquares(map) {
		var list = getCoordList();
		
		for ( var int = 0; int < list.length; int++) {
				var currentCoordObj = list[int];
				var currBounds = boundsMaker(currentCoordObj);
				rectList.push(new google.maps.Rectangle({
					bounds : currBounds,
					map : map,
					editable : true
				}));
			}
	}

	function boundsMaker(coordObj) {
		return new google.maps.LatLngBounds(latLngMaker(coordObj.sw),
				latLngMaker(coordObj.ne));
	}

	function latLngMaker(obj) {
		// console.log("<"+list[0]+" : "+list[1]+">");
		return new google.maps.LatLng(obj.lat, obj.lng);
	}

	window.coordinateWizzard = function(map, targetMarker) {

		makeSquares(map);

		map.setZoom(3);

		var overlay = new google.maps.StreetViewCoverageLayer();
		overlay.setMap(map);

		google.maps.event.addListener(map, 'click', function(e) {
			var moreOrLess = (100 / Math.pow(2, map.getZoom()));
			var bounds = new google.maps.LatLngBounds(new google.maps.LatLng(
					e.latLng.lat() - moreOrLess, e.latLng.lng() - moreOrLess),
					new google.maps.LatLng(e.latLng.lat() + moreOrLess,
							e.latLng.lng() + moreOrLess));

			var rectangle = new google.maps.Rectangle({
				bounds : bounds,
				map : map,
				editable : true
			});

			rectList.push(rectangle);

		});

		google.maps.event.addListener(targetMarker, 'click', function() {
			var totalAreaSize = 0;
			var res = "[\n";
			console.log(rectList.length);
			for ( var int = 0; int < rectList.length; int++) {
				
				var rect = rectList[int].getBounds();

				if (int > 0) {
					res += ",\n";
				}
				res += "  {\n";


				res += "  cumulativeAreaBounds : {\n";
				res += "    bottom : " + totalAreaSize + ",\n";
				totalAreaSize += computeArea(rect);
				res += "    top : " + totalAreaSize + "\n";
				res += "  },\n";
				res += "  ne : {lat : " + rect.getNorthEast().lat() + ", "
						+ "lng : " + rect.getNorthEast().lng() + "},\n";
				res += "  sw : {lat : " + rect.getSouthWest().lat() + ", "
						+ "lng : " + rect.getSouthWest().lng() + "}\n";
				res += "  }";

				// getBounds()

			}
			res += "\n]";
			console.log(res);
		});
	};

	function computeArea(rect) {
		var listOfLatLng = [
				rect.getNorthEast(),
				new google.maps.LatLng(rect.getNorthEast().lat(), rect
						.getSouthWest().lng()),
				rect.getSouthWest(),
				new google.maps.LatLng(rect.getSouthWest().lat(), rect
						.getNorthEast().lng()) ];

		return google.maps.geometry.spherical.computeArea(listOfLatLng);
	}
	
	window.coordinateWizzardIncluded = true;
})();