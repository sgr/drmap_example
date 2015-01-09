//  -*- coding: utf-8-unix -*-
var map; // Google Mapオブジェクト
var trail = []; // 軌跡を保持する配列
var TRAIL_MAX = 20; 

var parse = function(error, csv) {
    if (csv !== undefined) {
	var data = d3.csv.parseRows(csv, function(r) {
	    var ops = {center: new google.maps.LatLng(r[1], r[2]), radius: 2, fillColor: "#FF5555"};
	    var point = new google.maps.Circle(ops);
	    return {timestamp: r[0], lat: r[1], lng: r[2], ax: r[3], ay: r[4], az: r[5], p: point};
	});
	if (data.length > 0) {
	    data.sort(function(a, b) {
		return a.timestamp - b.timestamp;
	    });
	    // trailへの追加とMapへのオーバレイ
	    if (trail.length > 0) {
		var trailtail = trail[trail.length - 1];
		for (var i = 0; i < data.length; i++) {
		    if (data[i].timestamp > trailtail.timestamp) {
			map.addOverlay(data[i].p);
			trail.push(data[i]);
		    }
		}
	    } else {
		for (var i = 0; i < data.length; i++) {
		    data[i].p.setMap(map);
		}
		trail = data;
	    }
	    // trailが最大長を超えていたら古い軌跡を削除
	    if (trail.length > TRAIL_MAX) {
		for (var i = 0; i < TRAIL_MAX - trail.length; i++) {
		    var old = trail.shift();
		    old.p.setMap(null);
		}
	    }
	    // 地図の中心点を軌跡の最後の位置に更新
	    if (trail.length > 0) {
		var trailtail = trail[trail.length - 1];
		map.panTo(new google.maps.LatLng(trailtail.lat, trailtail.lng));
	    }
	}
    } else {
	// TODO エラー処理を書く
	//alert("Error: " + error);
    }
}

var polling = function() {
    d3.text("output.csv", parse);
}

var initialize = function() {
    var latlng = new google.maps.LatLng(35.662459, 139.711097);
    var opts = {
	Zoom: 18,
	center: latlng,
	mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), opts);
}

// Document Ready
$(function() {
    initialize();
    setInterval(polling, 5000);
});
