(function() {

	window.selectiveRandom = (function() {
		var list = getCoordList();

		var rangeBot = 0;
		var rangeTop = list.length - 1;
		var totalArea = list[rangeTop].cumulativeAreaBounds.top;

		var midIndex = getMidIndex(rangeBot, rangeTop);

		var randomPick = Math.random() * totalArea;

		var chosenBounds = list[midIndex].cumulativeAreaBounds;

		console.log("midIndex : "+midIndex);
		console.log("randomPick : "+randomPick);
		console.log(list[midIndex]);

		while ((!inRange(randomPick, chosenBounds)) && (rangeBot < rangeTop)) {

			if (randomPick <= chosenBounds.bottom) {
				rangeTop = Math.max(rangeBot, (midIndex - 1));
			} else {
				rangeBot = Math.min(rangeTop, (midIndex + 1));
			}

			midIndex = getMidIndex(rangeBot, rangeTop);
			console.log("midIndex : "+midIndex);
			console.log("randomPick : "+randomPick);
			console.log(list[midIndex]);
			
			chosenBounds = list[midIndex].cumulativeAreaBounds;

		}

		var randLat = randInRange(list[midIndex].sw.lat, list[midIndex].ne.lat);
		var randLng = randInRange(list[midIndex].sw.lng, list[midIndex].ne.lng);
		return new google.maps.LatLng(randLat, randLng);

	});

	function getMidIndex(rangeBot, rangeTop) {
		return Math.round((rangeBot + rangeTop) / 2);
	}

	function randInRange(rangeBot, rangeTop) {
		var rangeSpan = (1 + rangeTop - rangeBot);
		return ((Math.random() * rangeSpan) + rangeBot);
	}

	function inRange(pick, chosenBounds) {
		return ((pick > chosenBounds.bottom) && (pick <= chosenBounds.top));
	}

	window.selectiveRandomIncluded = true;
})();