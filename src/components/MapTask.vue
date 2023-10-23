<script setup>
/* eslint-disable no-undef*/
import { ref, onMounted } from 'vue'
import { Loader } from '@googlemaps/js-api-loader'
import { GoogleMap, Marker } from "vue3-google-map"

let id = 0
let utcOffset = 0
let myLocation = null;
let autocomplete = null;

const time = ref();
const date = ref();
const records = ref([])
const markers = ref([])
const searchInput = ref()
const showWarning = ref(false)
const itemsSelected = ref([])
const center = ref({ lat: 43.7183356, lng: -79.4606294 });
const GOOGLE_MAPS_API_KEY = 'AIzaSyDiRvsYqM24uo_Vij5viHixdMvjfsNAkJY'

const headers = ref([
  { text: "Id", value: "id" },
  { text: "Address", value: "address" }
])

const loader = new Loader({
  apiKey: GOOGLE_MAPS_API_KEY,
  version: "weekly",
  libraries: ["places"]
})

onMounted(async () => {
  await loader.load()
  navigator.geolocation.getCurrentPosition((position) => {
    myLocation = { lat: position.coords.latitude, lng: position.coords.longitude }
    center.value = myLocation
  });

  autocomplete = new google.maps.places.Autocomplete(searchInput.value, {
    types: [],
    fields: ["formatted_address", "geometry", "name", "utc_offset_minutes"]
  });

  google.maps.event.addListener(autocomplete, "place_changed", () => {
    const place = autocomplete.getPlace();

    addRecord(place)
  });
})

function removeRecords() {
  let selectedIds = [];

  itemsSelected.value.forEach((item) => selectedIds.push(item.id));

  records.value = records.value.filter(
    record => !selectedIds.includes(record.id)
  );

  markers.value = markers.value.filter(
    marker => !selectedIds.includes(marker.id)
  );

  itemsSelected.value = [];
}

function addRecord(place) {
  if (place.geometry) {
    records.value.push({ id: id, address: `${place.name} ${place.formatted_address}` })
    markers.value.push({ id: id, position: place.geometry.location, label: `${id}` })
    id++

    utcOffset = place.utc_offset_minutes
    center.value = place.geometry.location
  }
}

function showMyLocation() {
  if (!myLocation) {
    showWarning.value = true
    navigator.geolocation.getCurrentPosition((position) => {
      myLocation = { lat: position.coords.latitude, lng: position.coords.longitude }
      center.value = myLocation
    })
  } else {
    center.value = myLocation
  }
}

function closeModal() {
  showWarning.value = false;
}

setInterval(updateTime, 1000)
updateTime()
function updateTime() {
  var cd = new Date()
  if (utcOffset != 0) {
    cd.setTime(cd.getTime() + (cd.getTimezoneOffset() + utcOffset) * 60000)
  }
  time.value = zeroPadding(cd.getHours(), 2) + ':' + zeroPadding(cd.getMinutes(), 2) + ':' + zeroPadding(cd.getSeconds(), 2)
  date.value = zeroPadding(cd.getFullYear(), 4) + '-' + zeroPadding(cd.getMonth() + 1, 2) + '-' + zeroPadding(cd.getDate(), 2)
}

function zeroPadding(num, digit) {
  var zero = ''
  for (var i = 0; i < digit; i++) {
    zero += '0'
  }
  return (zero + num).slice(-digit)
}
</script>

<template>
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
  <div class="container-fluid">
    <div class="row my-3">
      <div class="col-sm-4">
        <div class="input-group">
          <input type="text" class="form-control" ref="searchInput" placeholder="Enter a location" />
          <button type="button" class="btn btn-labeled btn-warning" @click="showMyLocation"><svg
              xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-crosshair"
              viewBox="0 0 16 16">
              <path
                d="M8.5.5a.5.5 0 0 0-1 0v.518A7.001 7.001 0 0 0 1.018 7.5H.5a.5.5 0 0 0 0 1h.518A7.001 7.001 0 0 0 7.5 14.982v.518a.5.5 0 0 0 1 0v-.518A7.001 7.001 0 0 0 14.982 8.5h.518a.5.5 0 0 0 0-1h-.518A7.001 7.001 0 0 0 8.5 1.018V.5Zm-6.48 7A6.001 6.001 0 0 1 7.5 2.02v.48a.5.5 0 0 0 1 0v-.48a6.001 6.001 0 0 1 5.48 5.48h-.48a.5.5 0 0 0 0 1h.48a6.002 6.002 0 0 1-5.48 5.48v-.48a.5.5 0 0 0-1 0v.48A6.001 6.001 0 0 1 2.02 8.5h.48a.5.5 0 0 0 0-1h-.48ZM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
            </svg></button>
        </div>
      </div>

      <div class="col-sm-2 float-start align-self-center">
        <p class="m-0 fs-5"> {{ date }} {{ time }}</p>
      </div>
      <div class="col-sm-6">
        <div class="input-group">
          <button @click="removeRecords" class="btn btn-danger">Delete records</button>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-sm-6">
        <GoogleMap :api-key="GOOGLE_MAPS_API_KEY" style="width: 100%; height: 500px" :center="center" :zoom="7">
          <Marker v-for="marker in markers" :key="marker.id" :options="marker" />
        </GoogleMap>
      </div>
      <div class="col-sm-6">
        <EasyDataTable buttons-pagination v-model:items-selected="itemsSelected" :rows-items="[10, 25]"
          :rows-per-page="10" :headers="headers" :items="records" :table-min-height="460" />
      </div>
    </div>
  </div>

  <div>
    <!-- Modal -->
    <div v-if="showWarning" class="modal fade show" tabindex="-1" aria-labelledby="exampleModalLabel" aria-modal="true"
      role="dialog" style="display:block">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Please share your location</h5>
            <button type="button" @click="closeModal" aria-label="Close">
              <span>&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>Please allowing the site to know your location.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" @click="closeModal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>