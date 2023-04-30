"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _App_mapZoom, _App_map, _App_startPoint, _App_endPoint, _App_workoutID;
var inputTime = document.getElementById("timeInput");
var logoHeader = document.querySelector(".header");
var workouts = document.querySelector(".workout-container");
var workoutsContainer = document.querySelector(".workouts");
var details = document.querySelector(".details");
var btn = document.querySelector(".accordion");
var panel = document.querySelector(".panel");
var userIcon = document.querySelector(".user-icon");
var settingsIcon = document.querySelector(".settings-icon");
var btnSubmit = document.querySelector(".btn_submit");
var workoutPanel = document.querySelector(".workoutPanel");
var mapContainer = document.getElementById("map");
var warningInfo = document.querySelector(".workout__warning");
var speedLabelForm = document.querySelector(".speedFormLabel");
var distanceLabelForm = document.querySelector(".distanceFormLabel");
var kcalLabelForm = document.querySelector(".kcalFormLabel");
var runner = {
    weight: 80,
};
var runners = [runner];
window.addEventListener("resize", function () {
    var widthWindow = document.body.clientWidth;
    if (widthWindow < 1000) {
        speedLabelForm.innerHTML = "Avg. speed";
        distanceLabelForm.innerHTML = "Total dist.";
        kcalLabelForm.innerHTML = "Total cal.";
    }
    if (widthWindow > 1000) {
        speedLabelForm.innerHTML = "Avgerage speed (km/h)";
        distanceLabelForm.innerHTML = "Total distance (km)";
        kcalLabelForm.innerHTML = "Total calories burned";
    }
});
var Workout = /** @class */ (function () {
    function Workout(time, name) {
        this.date = new Date();
        this.id = (Date.now() + "").slice(-10);
        this.time = time;
        this.name = name;
    }
    Workout.prototype.calcKcal = function (weight) {
        var MET = 0.2 * this.speed + 0.9 * this.speed + 3.5;
        this.kcal = (this.time * MET * 3.5 * weight) / 200;
        return this.kcal;
    };
    Workout.prototype.calcSpeed = function (distance) {
        // km/h
        this.speed = distance / (this.time / 60);
        return this.speed;
    };
    return Workout;
}());
var App = /** @class */ (function () {
    function App() {
        _App_mapZoom.set(this, 12);
        _App_map.set(this, void 0);
        _App_startPoint.set(this, [17.026715, 51.057728]);
        _App_endPoint.set(this, void 0);
        _App_workoutID.set(this, 0);
        //geojsonTrack;
        this.trackArr = [];
        this.markersArr = [];
        this.workoutsArr = [];
        ////////////////////////Geting rout between two markers (geajason data is stored to be later one used for displaying tracks for workouts)/////////////////////////////////
        this._getRoute = function (start, end) {
            return __awaiter(this, void 0, void 0, function () {
                var query, json, data, distance, route, geojson;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // make a directions request
                            this.isEditing = true;
                            warningInfo.remove();
                            return [4 /*yield*/, fetch("https://api.mapbox.com/directions/v5/mapbox/walking/".concat(start[0], ",").concat(start[1], ";").concat(end[0], ",").concat(end[1], "?steps=true&geometries=geojson&access_token=").concat(mapboxgl.accessToken), { method: "GET" })];
                        case 1:
                            query = _a.sent();
                            return [4 /*yield*/, query.json()];
                        case 2:
                            json = _a.sent();
                            data = json.routes[0];
                            distance = data.distance / 1000;
                            route = data.geometry.coordinates;
                            geojson = {
                                type: "Feature",
                                properties: {},
                                geometry: {
                                    type: "LineString",
                                    coordinates: route,
                                },
                            };
                            // if the route already exists on the map, we'll reset it using setData
                            if (__classPrivateFieldGet(this, _App_map, "f").getSource("route")) {
                                __classPrivateFieldGet(this, _App_map, "f").getSource("route").setData(geojson);
                            }
                            // otherwise, we'll make a new request
                            else {
                                __classPrivateFieldGet(this, _App_map, "f").addLayer({
                                    id: "route",
                                    type: "line",
                                    source: {
                                        type: "geojson",
                                        data: geojson,
                                    },
                                    layout: {
                                        "line-join": "round",
                                        "line-cap": "round",
                                    },
                                    paint: {
                                        "line-color": "#ad3d1e",
                                        "line-width": 5,
                                        "line-opacity": 0.75,
                                    },
                                });
                            }
                            if (this.isEditing) {
                                this.trackArr[this.id] = geojson;
                            }
                            return [2 /*return*/, ((this.distance = distance), (this.geojsonTrack = geojson))];
                    }
                });
            });
        };
        this._getLocation();
        // prettier-ignore
        userIcon.addEventListener("click", function () {
            details.classList.toggle("hidden");
            userIcon.classList.toggle("clicked");
            ///placeholder z wpisana waga
        });
        workouts.addEventListener("click", this._drawTrack.bind(this));
        workouts.addEventListener("click", this._addWorkout.bind(this));
        workouts.addEventListener("click", this._deleteWorkout.bind(this));
        workouts.addEventListener("click", this._editWorkout.bind(this));
        logoHeader.addEventListener("click", this._changeWeight.bind(this));
    }
    App.prototype._renderSpinner = function () {
        // prettier-ignore
        var markup = "\n      <div class=\"spinner\"><svg><use href=\"img/sprite-spinner.svg#icon-spinner11\"></use></svg></div>";
        mapContainer.insertAdjacentHTML("beforeend", markup);
    };
    ////////////////////////User detail info calculation/////////////////////////////////
    App.prototype._totalDistance = function () {
        var distArr = this.workoutsArr.map(function (e) { return e.distance; });
        var total = distArr.reduce(function (acc, cur, _1, _2) {
            return acc + cur;
        }, 0);
        document.querySelector(".totalDist").placeholder = "".concat(total.toFixed(2));
    };
    App.prototype._totalKcal = function () {
        var kcalArr = this.workoutsArr.map(function (e) { return e.kcal; });
        var total = kcalArr.reduce(function (acc, cur, _1, _2) {
            return acc + cur;
        }, 0);
        document.querySelector(".totalKcal").placeholder = "".concat(Math.trunc(total));
    };
    App.prototype._totalSpeed = function () {
        var speedArr = this.workoutsArr.map(function (e) { return e.speed; });
        var total = speedArr.reduce(function (acc, cur, _1, _2) {
            return acc + cur;
        }, 0);
        document.querySelector(".totalSpeed").placeholder = "".concat(total.toFixed(2));
    };
    ////////////////////////Draw track for the stored workout/////////////////////////////////
    App.prototype._drawTrack = function (e) {
        var _a, _b, _c, _d;
        var target = e.target;
        if (target.classList.contains("btn-show_track")) {
            var parent_1 = target.closest(".workout");
            var id = +((_a = parent_1.dataset.id) === null || _a === void 0 ? void 0 : _a.toString().split("-")[1]);
            var coords = (_b = this.trackArr[+id]) === null || _b === void 0 ? void 0 : _b.geometry.coordinates;
            console.log(this.trackArr);
            this.markersArr.forEach(function (e) {
                e.remove();
            });
            if (__classPrivateFieldGet(this, _App_map, "f").getLayer("route")) {
                __classPrivateFieldGet(this, _App_map, "f").removeLayer("route");
                __classPrivateFieldGet(this, _App_map, "f").removeSource("route");
            }
            ///fit to the bounds of a LineString
            var bounds = new mapboxgl.LngLatBounds(coords[0], coords[0]);
            for (var _i = 0, coords_1 = coords; _i < coords_1.length; _i++) {
                var coord = coords_1[_i];
                bounds.extend(coord);
            }
            __classPrivateFieldGet(this, _App_map, "f").fitBounds(bounds, {
                padding: 50,
            });
            ///add markers
            var geojson = {
                type: "Feature",
                properties: {},
                geometry: {
                    type: "LineString",
                    // prettier-ignore
                    "coordinates": coords,
                },
            };
            if (__classPrivateFieldGet(this, _App_map, "f").getLayer("track")) {
                __classPrivateFieldGet(this, _App_map, "f").getSource("track").setData(geojson);
            }
            else {
                (_c = __classPrivateFieldGet(this, _App_map, "f")) === null || _c === void 0 ? void 0 : _c.addLayer({
                    id: "track",
                    type: "line",
                    source: {
                        type: "geojson",
                        data: geojson,
                    },
                    layout: {
                        "line-join": "round",
                        "line-cap": "round",
                    },
                    paint: {
                        "line-color": "#e47c5e",
                        "line-width": 5,
                        "line-opacity": 0.75,
                    },
                });
            }
            // Create a new marker.
            var indexLast = ((_d = geojson.geometry.coordinates) === null || _d === void 0 ? void 0 : _d.length) - 1;
            var start = {
                type: "FeatureCollection",
                features: [
                    {
                        type: "Feature",
                        properties: {},
                        geometry: {
                            type: "Point",
                            coordinates: geojson.geometry.coordinates[0],
                        },
                    },
                ],
            };
            if (__classPrivateFieldGet(this, _App_map, "f").getLayer("start")) {
                __classPrivateFieldGet(this, _App_map, "f").getSource("start").setData(start);
            }
            else {
                __classPrivateFieldGet(this, _App_map, "f").addLayer({
                    id: "start",
                    type: "circle",
                    source: {
                        type: "geojson",
                        data: {
                            type: "FeatureCollection",
                            features: [
                                {
                                    type: "Feature",
                                    properties: {},
                                    geometry: {
                                        type: "Point",
                                        coordinates: geojson.geometry.coordinates[0],
                                    },
                                },
                            ],
                        },
                    },
                    paint: {
                        "circle-radius": 10,
                        "circle-color": "#ad3d1e",
                    },
                });
            }
            var end = {
                type: "FeatureCollection",
                features: [
                    {
                        type: "Feature",
                        properties: {},
                        geometry: {
                            type: "Point",
                            coordinates: geojson.geometry.coordinates[indexLast],
                        },
                    },
                ],
            };
            if (__classPrivateFieldGet(this, _App_map, "f").getLayer("end")) {
                __classPrivateFieldGet(this, _App_map, "f").getSource("end").setData(end);
            }
            else {
                __classPrivateFieldGet(this, _App_map, "f").addLayer({
                    id: "end",
                    type: "circle",
                    source: {
                        type: "geojson",
                        data: {
                            type: "FeatureCollection",
                            features: [
                                {
                                    type: "Feature",
                                    properties: {},
                                    geometry: {
                                        type: "Point",
                                        coordinates: geojson.geometry.coordinates[indexLast],
                                    },
                                },
                            ],
                        },
                    },
                    paint: {
                        "circle-radius": 10,
                        "circle-color": "#ad3d1e",
                    },
                });
            }
        }
    };
    ////////////////////////Ading new workout and calculating the user stats/////////////////////////////////
    App.prototype._addWorkout = function (e) {
        var target = e.target;
        var edit = document.querySelector(".workout__edit");
        if (target.classList.contains("btn_form") && !edit) {
            this._newWorkout();
            this._calculateUserStats();
            this.markersArr.forEach(function (e) {
                e.remove();
            });
            this._removeTrackAndRoute();
            this._setInputToEmpty();
        }
    };
    App.prototype._calculateUserStats = function () {
        this._totalDistance();
        this._totalKcal();
        this._totalSpeed();
    };
    App.prototype._deleteWorkout = function (e) {
        var _this = this;
        var target = e.target;
        if (target.closest(".btn-delete")) {
            //zmienic zeby targetowalo button nie "X"
            var parentID = target.closest(".workout");
            parentID.remove();
            var id = target.closest(".workout").dataset.id.split("-")[1];
            this.workoutsArr.splice(+id, 1);
            __classPrivateFieldSet(this, _App_workoutID, 0, "f");
            var workoutsUpdate = document.querySelectorAll(".workout");
            workoutsUpdate.forEach(function (e) {
                var _a;
                var idArr = e.dataset.id.split("-");
                idArr[1] = __classPrivateFieldGet(_this, _App_workoutID, "f");
                e.dataset.id = idArr.join("-");
                __classPrivateFieldSet(_this, _App_workoutID, (_a = __classPrivateFieldGet(_this, _App_workoutID, "f"), _a++, _a), "f");
            });
            this._calculateUserStats();
            this.trackArr.splice(id, 1);
            this._removeStartAndEnd();
            this._removeTrackAndRoute();
        }
    };
    App.prototype._editWorkout = function (e) {
        var target = e.target;
        var edit = document.querySelector(".workout__edit");
        var time = document.querySelector(".duration").value;
        var name = document.querySelector(".workout-title")
            .value;
        if (target.classList.contains("btn-edit")) {
            this.parentID = target.closest(".workout");
            this.parentID.classList.add("hidden-left");
            this.id = target.closest(".workout").dataset.id.split("-")[1];
            workoutPanel.classList.remove("hidden");
            if (this.id) {
                // prettier-ignore
                var markupWarning = "<div\n        class=\"workout workout__warning workout__edit bg-white p-3 mb-3 bg-opacity-85 rounded-1 shadow-main position-relative\"><p class=\"workout__warning-text\">Editing workout named \"".concat(this.workoutsArr[this.id].name, "\".<br> To change the distance please add new markers.</p>\n      </div>");
                workouts.insertAdjacentHTML("afterbegin", markupWarning);
            }
            return this.id;
        }
        if (target.classList.contains("btn_form") && edit != null) {
            if (time != "" && name != "") {
                this.workoutsArr[this.id].name = document.querySelector(".workout-title").value;
                this.workoutsArr[this.id].time = document.querySelector(".duration").value;
            }
            else if (time == "" && name == "") {
                this.workoutsArr[this.id].name = this.workoutsArr[this.id].name;
                this.workoutsArr[this.id].time = this.workoutsArr[this.id].time;
            }
            var speed = this.workoutsArr[this.id]
                .calcSpeed(this.distance)
                .toFixed(2);
            var kcal = Math.trunc(this.workoutsArr[this.id].calcKcal(runner.weight));
            var distance = this.markersArr.length > 0
                ? this.distance
                : this.workoutsArr[this.id].distance;
            this.workoutsArr[this.id].distance = distance;
            var editedMarkup = this._createWorkoutMarkup(this.workoutsArr[this.id].name, distance, this.workoutsArr[this.id].time, speed, kcal);
            this._calculateUserStats();
            workoutPanel.classList.add("hidden");
            var idArr = this.parentID.dataset.id;
            var elToEdit = document.querySelector("[data-id=".concat(idArr, "]"));
            elToEdit.innerHTML = editedMarkup;
            this.parentID.classList.remove("hidden-left");
            this._setInputToEmpty();
            edit.remove();
            this.isEditing = false;
        }
    };
    App.prototype._setInputToEmpty = function () {
        document.querySelector(".duration").value = "";
        document.querySelector(".workout-title").value = "";
    };
    App.prototype._createWorkoutMarkup = function (name, distance, time, speed, kcal) {
        return "\n    <span class=\"workout-title\">".concat(name, "</span><div class=\"btn-container position-absolute me-3 d-inline\"><button class=\"btn btn-primary me-2 btn-show_track\">Show Track</button><button class=\"btn btn-primary me-2 btn-edit\">Edit</button><button class=\"btn btn-primary btn-delete\"><i class=\"fa fa-close\"></i></button></div><form class=\"workout__form row gy-3 p-3 pb-4\"><div class=\"form-group col\"><label for=\"distanceInput\" class=\"custom-file-label\">Distance</label><input type=\"text\" class=\"form-control\" id=\"distanceInput\" placeholder=\"").concat(distance.toFixed(2), " km\" readonly/></div><div class=\"form-group col\"><label for=\"timeInput\">Duration</label><input type=\"text\" class=\"form-control\" id=\"timeInput\" placeholder=\"").concat(time, " minutes\" readonly/></div><div class=\"form-group col\"><label for=\"cadenceInput\">Avg. Speed</label><input type=\"text\" class=\"form-control\" id=\"cadenceInput\" placeholder=\"").concat(speed, " km/h\" readonly/></div><div class=\"form-group col\"><label for=\"kcalInput\">Kcal burned</label>\n    <input type=\"text\" class=\"form-control\" id=\"kcalInput\" placeholder=\"").concat(kcal, " kcal\" readonly/></div></form>");
    };
    App.prototype._changeWeight = function (e) {
        e.preventDefault();
        var target = e.target;
        if (target.classList.contains("btn_weight")) {
            var newWeight = document.getElementById("weightInput").value;
            runner.weight = newWeight;
        }
    };
    ////////////////////////Getting current location/////////////////////////////////
    App.prototype._getLocation = function () {
        if (navigator.geolocation)
            this._renderSpinner();
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
            alert("Could not get your position:( Please alow your location in order to start tracking your workouts:)");
        });
    };
    App.prototype._loadMap = function (position) {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        var coords = [longitude, latitude];
        var spinner = document.querySelector(".spinner");
        spinner.remove();
        mapboxgl.accessToken =
            "pk.eyJ1IjoidGFsZW5pa292IiwiYSI6ImNsMHNuYWowNzBlaTgza3FrZmcycjcxZm8ifQ.8wNfBcKD4HMpwBqflCTEOw";
        __classPrivateFieldSet(this, _App_map, new mapboxgl.Map({
            container: "map",
            style: "mapbox://styles/talenikov/cl0sp2kal004b15pem1el6bls",
            center: coords,
            zoom: __classPrivateFieldGet(this, _App_mapZoom, "f"),
        }), "f");
        this._getStartEnd();
    };
    App.prototype._getStartEnd = function () {
        var _this = this;
        var markCoordsArr = [];
        var markArr = [];
        __classPrivateFieldGet(this, _App_map, "f").on("click", function (event) {
            var coords = Object.keys(event.lngLat).map(function (key) { return event.lngLat[key]; });
            workoutPanel.classList.remove("hidden");
            var customMarker = document.createElement("div");
            var className = markCoordsArr.length < 1 ? "marker" : "markerEnd";
            customMarker.className = className;
            var marker = new mapboxgl.Marker({
                anchor: "bottom",
                draggable: true,
                element: customMarker,
            })
                .setLngLat(coords)
                .addTo(__classPrivateFieldGet(_this, _App_map, "f"));
            markArr.push(marker);
            markCoordsArr.push(coords);
            if (markCoordsArr.length == 2) {
                _this._getRoute(markCoordsArr[0], markCoordsArr[1]);
                markCoordsArr = [];
            }
            if (markArr.length > 2) {
                markArr.splice(0, 2).forEach(function (e) { return e.remove(); });
                _this._removeStartAndEnd();
                _this._removeTrackAndRoute();
            }
            return markCoordsArr, markArr;
        });
        return (this.markersArr = markArr);
    };
    App.prototype._removeTrackAndRoute = function () {
        if (__classPrivateFieldGet(this, _App_map, "f").getLayer("route")) {
            __classPrivateFieldGet(this, _App_map, "f").removeLayer("route");
            __classPrivateFieldGet(this, _App_map, "f").removeSource("route");
        }
        if (__classPrivateFieldGet(this, _App_map, "f").getLayer("track")) {
            __classPrivateFieldGet(this, _App_map, "f").removeLayer("track");
            __classPrivateFieldGet(this, _App_map, "f").removeSource("track");
        }
    };
    App.prototype._removeStartAndEnd = function () {
        if (__classPrivateFieldGet(this, _App_map, "f").getLayer("start")) {
            __classPrivateFieldGet(this, _App_map, "f").removeLayer("start");
            __classPrivateFieldGet(this, _App_map, "f").removeSource("start");
        }
        if (__classPrivateFieldGet(this, _App_map, "f").getLayer("end")) {
            __classPrivateFieldGet(this, _App_map, "f").removeLayer("end");
            __classPrivateFieldGet(this, _App_map, "f").removeSource("end");
        }
    };
    ////////////////////////Workout generator/////////////////////////////////
    App.prototype._newWorkout = function () {
        var _a;
        var time = document.querySelector(".duration").value;
        var name = document.querySelector(".workout-title").value;
        var warningInfo = document.querySelector(".workout__warning");
        if (!isNaN(time) && time != "" && name != "") {
            var workout = new Workout(time, name);
            var speed = workout.calcSpeed(this.distance).toFixed(2);
            var kcal = Math.trunc(workout.calcKcal(runner.weight));
            workout.start = __classPrivateFieldGet(this, _App_startPoint, "f");
            workout.end = __classPrivateFieldGet(this, _App_endPoint, "f");
            workout.distance = +this.distance;
            this.trackArr.push(this.geojsonTrack);
            // prettier-ignore
            var markup = "<div\n      class=\"workout mt-3 pt-3 bg-white bg-opacity-85 rounded-1 shadow-main position-relative\" data-id=\"w-".concat(__classPrivateFieldGet(this, _App_workoutID, "f"), "\">").concat(this._createWorkoutMarkup(name, this.distance, time, speed, kcal), "\n      </div>");
            this.workoutsArr.push(workout);
            __classPrivateFieldSet(this, _App_workoutID, (_a = __classPrivateFieldGet(this, _App_workoutID, "f"), _a++, _a), "f");
            workouts.insertAdjacentHTML("beforeend", markup);
            workoutPanel.classList.add("hidden");
        }
        if (warningInfo) {
            warningInfo.remove();
        }
        if (isNaN(time) || time == "" || name == "") {
            var markupWarning = this._inputValidation(time, name);
            var widthWindow = document.body.clientWidth;
            if (widthWindow < 600) {
                if (!workoutPanel.classList.contains("hidden"))
                    workoutPanel.insertAdjacentHTML("afterbegin", markupWarning);
            }
            else if (widthWindow > 600) {
                workouts.insertAdjacentHTML("afterbegin", markupWarning);
            }
        }
    };
    App.prototype._inputValidation = function (time, name) {
        var markupWarning;
        if (isNaN(time)) {
            // prettier-ignore
            return (markupWarning = "<div\n      class=\"workout workout__warning bg-white p-3 mb-3 bg-opacity-85 rounded-1 shadow-main position-relative\"><p class=\"workout__warning-text\">Input for the duration should be type of number.</p>\n    </div>");
        }
        if (time.toString() == "" || name == "") {
            return (markupWarning = "<div\n      class=\"workout workout__warning bg-white p-3 mb-3 bg-opacity-85 rounded-1 shadow-main position-relative\"><p class=\"workout__warning-text\">Inputs for name and duration can't be empty!</p>\n    </div>");
        }
        return markupWarning;
    };
    return App;
}());
_App_mapZoom = new WeakMap(), _App_map = new WeakMap(), _App_startPoint = new WeakMap(), _App_endPoint = new WeakMap(), _App_workoutID = new WeakMap();
////////////////////////App initialization/////////////////////////////////
var init = new App();
