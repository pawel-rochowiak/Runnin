"use strict";

const inputTime = document.getElementById("timeInput")!;
const logoHeader = document.querySelector(".header")!;
const workouts = document.querySelector(".workout-container")!;
const workoutsContainer = document.querySelector(".workouts")!;
const details = document.querySelector(".details")!;
const btn = document.querySelector(".accordion")!;
const panel = document.querySelector(".panel")!;
const userIcon = document.querySelector(".user-icon")!;
const settingsIcon = document.querySelector(".settings-icon")!;
const btnSubmit = document.querySelector(".btn_submit")!;
const workoutPanel = document.querySelector(".workoutPanel")!;
const mapContainer = document.getElementById("map")!;
const warningInfo = document.querySelector(".workout__warning")!;
const speedLabelForm = document.querySelector(".speedFormLabel")!;
const distanceLabelForm = document.querySelector(".distanceFormLabel")!;
const kcalLabelForm = document.querySelector(".kcalFormLabel")!;

const runner: { weight: number } = {
  weight: 80,
};

const runners: {}[] = [runner];

window.addEventListener("resize", function () {
  const widthWindow = document.body.clientWidth;

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

class Workout {
  time: number;
  name: string;
  distance?: number | string;
  protected speed!: number;
  protected kcal!: number;
  start?: number[];
  end?: number[];
  date: Date = new Date();
  id: string = (Date.now() + "").slice(-10);

  constructor(time: number, name: string) {
    this.time = time;
    this.name = name;
  }

  calcKcal(weight: number): number {
    const MET = 0.2 * this.speed + 0.9 * this.speed + 3.5;
    this.kcal = (this.time * MET * 3.5 * weight) / 200;
    return this.kcal;
  }

  calcSpeed(distance: number): number {
    // km/h
    this.speed = distance / (this.time / 60);
    return this.speed;
  }
}

interface Markers {
  remove(): void;
}

class App {
  #mapZoom: number = 12;
  #map!: any;
  #startPoint: number[] = [17.026715, 51.057728];
  #endPoint?: number;
  #workoutID: number = 0;
  id!: number;
  parentID?: string | HTMLDivElement;
  distance?: number;
  total!: number;
  isEditing?: boolean;
  geojsonTrack?: { geometry: { coordinates: number[] } };
  trackArr: { geometry: { coordinates: [] } }[] = [];
  markersArr: Markers[] = [];
  workoutsArr: {
    distance: number;
    kcal: number;
    speed: number;
    name: string;
    time: number | string;
    calcSpeed: Function;
    calcKcal: Function;
  }[] = [];

  constructor() {
    this._getLocation();
    // prettier-ignore

    userIcon.addEventListener("click", function () {
        details.classList.toggle("hidden");
        userIcon.classList.toggle("clicked");
        ///placeholder z wpisana waga
      })
    workouts.addEventListener("click", this._drawTrack.bind(this));
    workouts.addEventListener("click", this._addWorkout.bind(this));
    workouts.addEventListener("click", this._deleteWorkout.bind(this));
    workouts.addEventListener("click", this._editWorkout.bind(this));
    logoHeader.addEventListener("click", this._changeWeight.bind(this));
  }

  _renderSpinner() {
    // prettier-ignore
    const markup = `
      <div class="spinner"><svg><use href="img/sprite-spinner.svg#icon-spinner11"></use></svg></div>`;
    mapContainer.insertAdjacentHTML("beforeend", markup);
  }
  ////////////////////////User detail info calculation/////////////////////////////////
  _totalDistance() {
    const distArr = this.workoutsArr.map((e) => e.distance);
    const total = distArr.reduce(function (acc, cur, _1, _2) {
      return acc + cur;
    }, 0);
    (document.querySelector(
      ".totalDist"
    ) as HTMLInputElement)!.placeholder = `${total.toFixed(2)}`;
  }
  _totalKcal() {
    const kcalArr = this.workoutsArr.map((e) => e.kcal);
    const total = kcalArr.reduce(function (acc, cur, _1, _2) {
      return acc + cur;
    }, 0);
    (document.querySelector(
      ".totalKcal"
    ) as HTMLInputElement)!.placeholder = `${Math.trunc(total)}`;
  }
  _totalSpeed() {
    const speedArr = this.workoutsArr.map((e) => e.speed);
    const total = speedArr.reduce(function (acc, cur, _1, _2) {
      return acc + cur;
    }, 0);
    (document.querySelector(
      ".totalSpeed"
    ) as HTMLInputElement)!.placeholder = `${total.toFixed(2)}`;
  }
  ////////////////////////Draw track for the stored workout/////////////////////////////////
  _drawTrack(e: Event) {
    const target = e.target! as HTMLElement;

    if (target.classList.contains("btn-show_track")) {
      const parent = target.closest(".workout")! as HTMLElement;
      const id: number = +parent.dataset.id?.toString().split("-")[1]!;
      const coords: [number, number][] = this.trackArr[+id]?.geometry
        .coordinates;
      this.markersArr.forEach((e) => {
        e.remove();
      });

      if (this.#map.getLayer("route")) {
        this.#map.removeLayer("route");
        this.#map.removeSource("route");
      }
      ///fit to the bounds of a LineString
      const bounds = new mapboxgl.LngLatBounds(coords[0], coords[0]);

      for (const coord of coords) {
        bounds.extend(coord);
      }
      this.#map.fitBounds(bounds, {
        padding: 50,
      });
      ///add markers
      const geojson = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          // prettier-ignore
          "coordinates": coords,
        },
      };
      if (this.#map.getLayer("track")) {
        this.#map.getSource("track").setData(geojson);
      } else {
        this.#map?.addLayer({
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
      const indexLast = geojson.geometry.coordinates?.length - 1;

      const start = {
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
      if (this.#map.getLayer("start")) {
        this.#map.getSource("start").setData(start);
      } else {
        this.#map.addLayer({
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

      const end = {
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
      if (this.#map.getLayer("end")) {
        this.#map.getSource("end").setData(end);
      } else {
        this.#map.addLayer({
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
  }
  ////////////////////////Ading new workout and calculating the user stats/////////////////////////////////

  _addWorkout(e: Event) {
    const target = e.target as HTMLElement;
    const edit = document.querySelector(".workout__edit");
    if (target!.classList.contains("btn_form") && !edit) {
      this._newWorkout();
      this._calculateUserStats();
      this.markersArr.forEach((e) => {
        e.remove();
      });

      this._removeTrackAndRoute();

      this._setInputToEmpty();
    }
  }

  _calculateUserStats() {
    this._totalDistance();
    this._totalKcal();
    this._totalSpeed();
  }

  _deleteWorkout(e: Event) {
    const target = e.target! as HTMLElement;
    if (target.closest(".btn-delete")) {
      //zmienic zeby targetowalo button nie "X"
      const parentID = target.closest(".workout")!;
      parentID.remove();

      const id = (target.closest(".workout") as HTMLElement).dataset.id!.split(
        "-"
      )[1];
      this.workoutsArr.splice(+id, 1);
      this.#workoutID = 0;

      const workoutsUpdate = document.querySelectorAll(".workout");

      workoutsUpdate.forEach((e) => {
        const idArr = (e as HTMLElement).dataset
          .id!.split("-")
          .map((el) => +el);
        idArr[1] = this.#workoutID;
        (e as HTMLElement).dataset.id = idArr.join("-");
        this.#workoutID++;
      });
      this._calculateUserStats();
      this.trackArr.splice(+id, 1);

      this._removeStartAndEnd();
      this._removeTrackAndRoute();
    }
  }

  _editWorkout(e: Event): void | number {
    const target = e.target! as HTMLElement;
    const edit = document.querySelector(".workout__edit")! as HTMLButtonElement;
    let time = (document.querySelector(".duration") as HTMLInputElement).value;
    let name = (document.querySelector(".workout-title") as HTMLInputElement)
      .value;

    if (target.classList.contains("btn-edit")) {
      this.parentID = target.closest(".workout") as HTMLDivElement;
      this.parentID!.classList.add("hidden-left");
      const workout = target.closest(".workout") as HTMLDivElement;
      if (workout) {
        this.id = +workout.dataset.id.split("-")[1];
      }

      workoutPanel.classList.remove("hidden");

      if (this.id) {
        // prettier-ignore
        const markupWarning = `<div
        class="workout workout__warning workout__edit bg-white p-3 mb-3 bg-opacity-85 rounded-1 shadow-main position-relative"><p class="workout__warning-text">Editing workout named "${this.workoutsArr[this.id].name}".<br> To change the distance please add new markers.</p>
      </div>`;
        workouts.insertAdjacentHTML("afterbegin", markupWarning);
      }
      return this.id;
    }

    if (target.classList.contains("btn_form") && edit != null) {
      if (time != "" && name != "") {
        this.workoutsArr[this.id].name = (document.querySelector(
          ".workout-title"
        ) as HTMLInputElement)!.value;
        this.workoutsArr[this.id].time = (document.querySelector(
          ".duration"
        ) as HTMLInputElement)!.value;
      } else if (time == "" && name == "") {
        this.workoutsArr[this.id].name = this.workoutsArr[this.id].name;
        this.workoutsArr[this.id].time = this.workoutsArr[this.id].time;
      }

      const speed = this.workoutsArr[this.id]
        .calcSpeed(this.distance)
        .toFixed(2);
      const kcal = Math.trunc(
        this.workoutsArr[this.id].calcKcal(runner.weight)
      );

      const distance =
        this.markersArr.length > 0
          ? this.distance
          : this.workoutsArr[this.id].distance;

      this.workoutsArr[this.id].distance = +distance!;

      const editedMarkup = this._createWorkoutMarkup(
        this.workoutsArr[this.id].name,
        +distance!,
        this.workoutsArr[this.id].time as string,
        speed,
        kcal.toString()
      );

      this._calculateUserStats();

      workoutPanel.classList.add("hidden");

      const idArr = (this.parentID! as HTMLDivElement).dataset.id;

      const elToEdit = document.querySelector(`[data-id=${idArr}]`);

      elToEdit!.innerHTML = editedMarkup;

      (this.parentID! as HTMLDivElement).classList.remove("hidden-left");

      this._setInputToEmpty();

      edit.remove();

      this.isEditing = false;
    }
  }

  _setInputToEmpty() {
    (document.querySelector(".duration")! as HTMLInputElement).value = "";
    (document.querySelector(".workout-title")! as HTMLInputElement).value = "";
  }

  _createWorkoutMarkup(
    name: string,
    distance: number,
    time: string,
    speed: string,
    kcal: string
  ) {
    return `
    <span class="workout-title">${name}</span><div class="btn-container position-absolute me-3 d-inline"><button class="btn btn-primary me-2 btn-show_track">Show Track</button><button class="btn btn-primary me-2 btn-edit">Edit</button><button class="btn btn-primary btn-delete"><i class="fa fa-close"></i></button></div><form class="workout__form row gy-3 p-3 pb-4"><div class="form-group col"><label for="distanceInput" class="custom-file-label">Distance</label><input type="text" class="form-control" id="distanceInput" placeholder="${distance.toFixed(
      2
    )} km" readonly/></div><div class="form-group col"><label for="timeInput">Duration</label><input type="text" class="form-control" id="timeInput" placeholder="${time} minutes" readonly/></div><div class="form-group col"><label for="cadenceInput">Avg. Speed</label><input type="text" class="form-control" id="cadenceInput" placeholder="${speed} km/h" readonly/></div><div class="form-group col"><label for="kcalInput">Kcal burned</label>
    <input type="text" class="form-control" id="kcalInput" placeholder="${kcal} kcal" readonly/></div></form>`;
  }

  _changeWeight(e) {
    e.preventDefault();
    const target = e.target;
    if (target.classList.contains("btn_weight")) {
      let newWeight = (document.getElementById(
        "weightInput"
      )! as HTMLInputElement).value;
      runner.weight = +newWeight;
    }
  }

  ////////////////////////Getting current location/////////////////////////////////

  _getLocation() {
    if (navigator.geolocation) this._renderSpinner();
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      function () {
        alert(
          "Could not get your position:( Please alow your location in order to start tracking your workouts:)"
        );
      }
    );
  }

  _loadMap() {
    // const { latitude } = position.coords;
    // const { longitude } = position.coords;
    // const coordsArr = [longitude, latitude];
    const spinner = document.querySelector(".spinner")!;
    spinner.remove();

    mapboxgl.accessToken =
      "pk.eyJ1IjoidGFsZW5pa292IiwiYSI6ImNsMHNuYWowNzBlaTgza3FrZmcycjcxZm8ifQ.8wNfBcKD4HMpwBqflCTEOw";
    this.#map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/talenikov/cl0sp2kal004b15pem1el6bls",
      center: this.#startPoint, // starting position
      zoom: this.#mapZoom,
    });
    this._getStartEnd();
  }

  ////////////////////////Geting rout between two markers (geajason data is stored to be later one used for displaying tracks for workouts)/////////////////////////////////

  _getRoute = async (start: number[], end: number[]) => {
    // make a directions request
    this.isEditing = true;
    warningInfo.remove();
    const query = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
      { method: "GET" }
    );
    const json = await query.json();
    const data = json.routes[0];
    const distance = data.distance / 1000;
    const route = data.geometry.coordinates;
    const geojson = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: route,
      },
    };
    // if the route already exists on the map, we'll reset it using setData
    if (this.#map.getSource("route")) {
      this.#map.getSource("route").setData(geojson);
    }
    // otherwise, we'll make a new request
    else {
      this.#map.addLayer({
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
    return (this.distance = distance), (this.geojsonTrack = geojson);
  };

  _getStartEnd() {
    let markCoordsArr: [number, number][] = [];
    let markArr: Markers[] = [];

    this.#map.on("click", (event: { lngLat: { lng: number; lat: number } }) => {
      const coords = Object.values(event.lngLat);
      workoutPanel.classList.remove("hidden");

      const customMarker = document.createElement("div");
      const className = markCoordsArr.length < 1 ? "marker" : "markerEnd";
      customMarker.className = className;
      const marker = new mapboxgl.Marker({
        anchor: "bottom",
        draggable: true,
        element: customMarker,
      })
        .setLngLat(coords as [number, number])
        .addTo(this.#map);

      markArr.push(marker);
      markCoordsArr.push(coords as [number, number]);

      if (markCoordsArr.length == 2) {
        this._getRoute(markCoordsArr[0], markCoordsArr[1]);
        console.log(markArr);
        markCoordsArr = [];
      }

      if (markArr.length > 2) {
        markArr.splice(0, 2).forEach((e) => e.remove());
        this._removeStartAndEnd();
        this._removeTrackAndRoute();
      }
      return markArr;
    });
    return (this.markersArr = markArr);
  }

  _removeTrackAndRoute() {
    if (this.#map.getLayer("route")) {
      this.#map.removeLayer("route");
      this.#map.removeSource("route");
    }
    if (this.#map.getLayer("track")) {
      this.#map.removeLayer("track");
      this.#map.removeSource("track");
    }
  }

  _removeStartAndEnd() {
    if (this.#map.getLayer("start")) {
      this.#map.removeLayer("start");
      this.#map.removeSource("start");
    }
    if (this.#map.getLayer("end")) {
      this.#map.removeLayer("end");
      this.#map.removeSource("end");
    }
  }
  ////////////////////////Workout generator/////////////////////////////////

  _newWorkout() {
    let time = (document.querySelector(".duration")! as HTMLInputElement).value;
    let name = (document.querySelector(".workout-title")! as HTMLInputElement)
      .value;
    const warningInfo = document.querySelector(".workout__warning");

    if (!isNaN(+time) && time != "" && name != "") {
      const workout = new Workout(+time, name);
      const speed = workout.calcSpeed(this.distance as number).toFixed(2);
      const kcal = Math.trunc(workout.calcKcal(runner.weight));
      workout.start = this.#startPoint;
      workout.end = this.#endPoint;
      workout.distance = +this.distance!;
      this.trackArr.push(this.geojsonTrack);

      // prettier-ignore
      const markup = `<div
      class="workout mt-3 pt-3 bg-white bg-opacity-85 rounded-1 shadow-main position-relative" data-id="w-${this.#workoutID}">${this._createWorkoutMarkup(name,this.distance as number,time,speed,kcal.toString())}
      </div>`;

      this.workoutsArr.push(workout);
      this.#workoutID++;

      workouts.insertAdjacentHTML("beforeend", markup);
      workoutPanel.classList.add("hidden");
    }

    if (warningInfo) {
      warningInfo.remove();
    }

    if (isNaN(+time) || time == "" || name == "") {
      const markupWarning = this._inputValidation(+time, name);
      const widthWindow = document.body.clientWidth;

      if (widthWindow < 600) {
        if (!workoutPanel.classList.contains("hidden"))
          workoutPanel.insertAdjacentHTML(
            "afterbegin",
            markupWarning as string
          );
      } else if (widthWindow > 600) {
        workouts.insertAdjacentHTML("afterbegin", markupWarning as string);
      }
    }
  }

  _inputValidation(time: number, name: string) {
    let markupWarning;
    if (isNaN(time)) {
      // prettier-ignore
      return (markupWarning = `<div
      class="workout workout__warning bg-white p-3 mb-3 bg-opacity-85 rounded-1 shadow-main position-relative"><p class="workout__warning-text">Input for the duration should be type of number.</p>
    </div>`);
    }
    if (time.toString() == "" || name == "") {
      return (markupWarning = `<div
      class="workout workout__warning bg-white p-3 mb-3 bg-opacity-85 rounded-1 shadow-main position-relative"><p class="workout__warning-text">Inputs for name and duration can't be empty!</p>
    </div>`);
    }
    return markupWarning;
  }
}
////////////////////////App initialization/////////////////////////////////
const init = new App();
