var map;
var infowindow;
var marker;
var cMarker;
var watch = null;
var watchId = null;
var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};


$(document).ready(function () {
    InitMap();
});


function GetLocSuccess(pos) {
    if ($("#hidCurLat").length > 0 && $("#hidCurLon").length > 0) {
        $("#hidCurLat").val(pos.coords.latitude);
        $("#hidCurLon").val(pos.coords.longitude);
    }

    watch.clearWatch(watchId);
    SetCurrentLocation();
}

function GetLocError(err) {
   // alert("خطا: امکان دریافت اطلاعات مکانی شما وجود ندارد!");
    if (map.getCenter() == null) {
        $("#hidCurLat").val("35.7594207");
        $("#hidCurLon").val("51.4177843");
        $("#hidLat").val("35.7594207");
        $("#hidLon").val("51.4177843");
        var pos = {
            lat: 35.7594207,
            lng: 51.4177843
        };
        MapSetCenter(pos);
    }
}

function InitCurrentLocation() {
    if (!watch) {
        watch = navigator.geolocation;
        watch.getCurrentPosition(GetLocSuccess, GetLocError, options);
    }
    else {
        watchId = watch.watchPosition(GetLocSuccess, GetLocError, options);
    }
    setTimeout(InitCurrentLocation, 1000);
}

function InitMap() {
    if ($("#map").length > 0) {
        if (!map) {
            var myOptions = {
                disableDefaultUI: true, // a way to quickly hide all controls
                mapTypeControl: false,
                scaleControl: true,
                zoomControl: true,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.LARGE
                },
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            map = new google.maps.Map(document.getElementById('map'), myOptions);
            if ($("#hidShowTrafic").val() == "1") {
                var trafficLayer = new google.maps.TrafficLayer();
                trafficLayer.setMap(map);
            }
        }
        if ($("#hidReadOnly").val() != "True") {
            InitCurrentLocation();

            AddSearch();
           /* google.maps.event.addListener(map, 'bounds_changed', function () {
                AddCenterMarker();
            });
            google.maps.event.addListener(map, 'drag', function () {
                AddCenterMarker();
            });*/

            $('<div/>').addClass('centerMarker').appendTo(map.getDiv());
            $(".centerMarker").click(function () {
                alert('شما این مکان را انتخاب کرده اید.');
            });
            //$('<div/>').addClass('centerAddress').appendTo(map.getDiv());

            google.maps.event.addListener(map, 'center_changed', function () {
                AddCenterMarker();
            });
        }
        else {
            SetRequestedLocation();
            if ($("#hidMapTitle").val() != '') {
                var contentString = '<div id=\"MapPop\"><div class=\"MarkerTitle\">' + $("#hidMapTitle").val() + '</div>';
                if ($("#hidMapContent").val() != "")
                    contentString += "<div class=\"MarkerBody\">" + $("#hidMapContent").val() + "</div>";
                contentString += '</div>';
                infowindow = new google.maps.InfoWindow({ content: contentString });
                infowindow.open(map, marker);
                marker.addListener('click', function () { infowindow.open(map, marker); });
            }
        }
    }
}

function GoToLocation(lat, lon) {
    if ($("#hidLat").length > 0 && $("#hidLon").length > 0) {
        $("#hidLat").val(lat);
        $("#hidLon").val(lon);
        SetRequestedLocation();
    }
}

function SetCurrentLocation() {
    if ($("#hidCurLat").length > 0 && $("#hidCurLon").length > 0 && $("#hidCurLat").val() != "" && $("#hidCurLon").val() != "") {
        var pos = {
            lat: parseFloat($("#hidCurLat").val()),
            lng: parseFloat($("#hidCurLon").val())
        };
        if (!cMarker) {
            cMarker = AddMarker(pos, "current.png");
            var divCenter = document.createElement('div');
            divCenter.className = 'MapCenter';
            divCenter.addEventListener('click', function () {
                var curpos = {
                    lat: parseFloat($("#hidCurLat").val()),
                    lng: parseFloat($("#hidCurLon").val())
                };
                map.setZoom(17);
                map.setCenter(curpos);
            });
            map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(divCenter);

            MapSetCenter(pos);
        }
        else {
            cMarker.setPosition(pos);
        }
    }
}

function SetRequestedLocation() {
    if ($("#hidLat").length > 0 && $("#hidLon").length > 0 && $("#hidLat").val() != "" && $("#hidLon").val() != "") {
        var pos = {
            lat: parseFloat($("#hidLat").val()),
            lng: parseFloat($("#hidLon").val())
        };
        if (!marker)
            marker = AddMarker(pos, "dynamic.png");
        else
            marker.setPosition(pos);
        MapSetCenter(pos);
    }
}

function AddCenterMarker() {
    var c = map.getCenter();
    /*if (!marker)
        marker = AddMarker(c, "dynamic.png");
    else
        marker.setPosition(c);*/
    if ($("#hidLat").length > 0)
        $("#hidLat").val(c.lat());
    if ($("#hidLon").length > 0)
        $("#hidLon").val(c.lng());
    if ($("#hidAddress").length > 0) {
        var geocoder = new google.maps.Geocoder;

        geocoder.geocode({ 'location': c }, function (results, status) {
            if (status === 'OK') {
                if (results[0]) {
                    $("#hidAddress").val(results[0].formatted_address);
                    $(".centerAddress").html(results[0].formatted_address);
                    $(".centerAddress").show();
                }
            }
        });
    }
}

function AddMarker(Position, Icon) {
    return new google.maps.Marker({ position: Position, map: map, icon: $("#lblRoot").val() + 'Images/Map/' + Icon });
}

function MapSetCenter(Position) {
    map.setCenter(Position);
    map.setZoom(17);
}

function ShowLocation(Latitude, Longitude, Zoom, Title, Content, Icon) {
    var uluru = { lat: Latitude, lng: Longitude };
    if (!map) {
        CreateMap();
        MapSetCenter(uluru);
    }

    var marker = AddMarker(uluru, Icon);

    if (Title != '') {
        var contentString = '<div id=\"MapPop\"><div class=\"MarkerTitle\">' + Title + '</div>';
        if (Content != "")
            contentString += "<div class=\"MarkerBody\">" + Content + "</div>";
        contentString += '</div>';
        infowindow = new google.maps.InfoWindow({ content: contentString });
        infowindow.open(map, marker);
        marker.addListener('click', function () { infowindow.open(map, marker); });
    }
}

function AddSearch() {
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('mapSearch'));
    var input = document.getElementById('mapSerachText');
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);
    autocomplete.addListener('place_changed', function () {
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            window.alert("متاسفانه اطلاعت برای: '" + place.name + "' موجود نیست!");
            return;
        }

        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }
    });
    $("#mapSearch").show();
}

/****************************************************************************************************/

function CustomMarker(latlng, map, args) {
    this.latlng = latlng;
    this.args = args;
    this.setMap(map);
}

CustomMarker.prototype = new google.maps.OverlayView();

CustomMarker.prototype.draw = function () {

    var self = this;

    var div = this.div;

    if (!div) {

        div = this.div = document.createElement('div');
        div.className = 'marker';
        div.innerHTML = "<div class=\"pin\"></div><div class=\"pin-effect\"></div>"

        if (typeof (self.args.marker_id) !== 'undefined') {
            div.dataset.marker_id = self.args.marker_id;
        }

        /*google.maps.event.addDomListener(div, "click", function (event) {
            alert('You clicked on a custom marker!');
            google.maps.event.trigger(self, "click");
        });
        */
        var panes = this.getPanes();
        panes.overlayImage.appendChild(div);
    }

    var point = this.getProjection().fromLatLngToDivPixel(this.latlng);

    if (point) {
        div.style.left = (point.x - 10) + 'px';
        div.style.top = (point.y - 20) + 'px';
    }
};

CustomMarker.prototype.remove = function () {
    if (this.div) {
        this.div.parentNode.removeChild(this.div);
        this.div = null;
    }
};

CustomMarker.prototype.getPosition = function () {
    return this.latlng;
};

function LoadingOn() {
    var d = document;
    if (d.getElementById("modalContainer")) return;

    mObj = d.getElementsByTagName("body")[0].appendChild(d.createElement("div"));
    mObj.id = "modalContainer";
    loading = true;
}

function LoadingOff() {
    document.getElementsByTagName("body")[0].removeChild(document.getElementById("modalContainer"));
    loading = false;
    UpdateReuestButtonText();
}

function bindInfoWindow(mk, pos) {
    mk.addListener('click', function () {
        infowindow.setContent(contents[pos]);
        infowindow.open(map, this);
    });
}