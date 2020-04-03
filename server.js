// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const geolib = require("geolib");

// our default array of dreams
const dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

const hospitalLocations = [
  {
    name: "Mariano Marcos Memorial & Medical Center",
    latitude: 18.060359,
    longitude: 120.559341
  },
  {
    name: "Gov. Roque B. Ablan Sr. Memorial Hospital",
    latitude: 18.199188,
    longitude: 120.601442
  },
  {
    name: "Sta. Teresita Hospital, Inc.",
    latitude: 18.0152,
    longitude: 120.673971
  },
  {
    name: "Bataan Doctors Hospital and Medical Center, Inc.",
    latitude: 14.682842,
    longitude: 120.542745
  },
  {
    name: "QUEZON CITY GENERAL HOSPITAL",
    latitude: 14.66111,
    longitude: 121.01815
  },
]

const findNearestHospital = (latitude, longitude) => {
  const locations = hospitalLocations.map(location => {
    const distance = geolib.getDistance({
      latitude,
      longitude
    }, {
      latitude: location.latitude,
      longitude: location.longitude
    });
    
    return Object.assign({}, location, {distance});
  });
  return locations;
};

// Get user's location using latitude and longitude
app.get('/nearest', (request, response) => {
  const latitude = request.query.latitude;
  const longitude = request.query.longitude;
  
  const locations = findNearestHospital(latitude, longitude);
  
  locations.sort((locationA, locationB) => {
    const distanceA = locationA.distance;
    const distanceB = locationB.distance;
    
    if (distanceA < distanceB) return -1;
    if (distanceA > distanceB) return 1;
  });
  
  const nearestLocation = locations.slice(0,3);
  
  response.json({nearestLocation});
})

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

// send the default array of dreams to the webpage
app.get("/dreams", (request, response) => {
  // express helps us take JS objects and send them as JSON
  response.json(dreams);
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
