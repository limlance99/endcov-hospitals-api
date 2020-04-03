// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const geolib = require("geolib");
const fs = require("fs");

// our default array of dreams
const dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];
var contents = fs.readFileSync("listOfHospitals.json");
// Define to JSON type
const hospitalLocations = JSON.parse(contents);
// const hospitalLocations = [
//   {
//     name: "Mariano Marcos Memorial & Medical Center",
//     latitude: 18.060359,
//     longitude: 120.559341
//   },
//   {
//     name: "Gov. Roque B. Ablan Sr. Memorial Hospital",
//     latitude: 18.199188,
//     longitude: 120.601442
//   },
//   {
//     name: "Sta. Teresita Hospital, Inc.",
//     latitude: 18.0152,
//     longitude: 120.673971
//   },
//   {
//     name: "Bataan Doctors Hospital and Medical Center, Inc.",
//     latitude: 14.682842,
//     longitude: 120.542745
//   },
//   {
//     name: "QUEZON CITY GENERAL HOSPITAL",
//     latitude: 14.66111,
//     longitude: 121.01815
//   },
// ]

const findNearestHospital = (latitude, longitude) => {
  const locations = hospitalLocations.map(location => {
    const distance = geolib.getDistance({
      latitude,
      longitude
    }, {
      latitude: location.LATITUDE,
      longitude: location.LONGITUDE
    });
    
    return Object.assign({}, location, {distance});
  });
  return locations;
};

const formatIntoMessage = (hospital) => {
  const name = hospital.Hospital;
  const contact = hospital.Contact ? hospital.Contact : "No contact details available.";
  const address = hospital.Address;
  
  const title = name;
  const subtitle= `${address}\n\n${contact}`;
  return {title, subtitle};
}
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
  
  const hospital1 = formatIntoMessage(locations[0]);
  const hospital2 = formatIntoMessage(locations[1]);
  const hospital3 = formatIntoMessage(locations[2]);
  const hospital4 = formatIntoMessage(locations[3]);
  const hospital5 = formatIntoMessage(locations[4]);
  
  response.json({
    messages: [
      {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            image_aspect_ratio: 'square',
            elements: [
              {
                title: hospital1.title,
                subtitle: hospital1.subtitle,
              },  
              {
                title: hospital2.title,
                subtitle: hospital2.subtitle,
              },  
              {
                title: hospital3.title,
                subtitle: hospital3.subtitle,
              },  
              {
                title: hospital4.title,
                subtitle: hospital4.subtitle,
              },  
              {
                title: hospital5.title,
                subtitle: hospital5.subtitle,
              },  
            ],
          }
        }
      }
    ]
  });
})

app.get('/show-buttons', (request, response) => {
  const {userId} = request.query;
  const displayUrl = "https://endcov-hospitals-api.glitch.me/";
  response.json({
    messages: [
      {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            image_aspect_ratio: 'square',
            elements: [
              {
                title: "Hello friend",
                subtitle: "Choose your preferences",
                buttons: [
                  {
                    type: "web_url",
                    url: displayUrl,
                    title: "Webview (compact)",
                    messenger_extensions: true,
                    webview_height_ratio: "compact"
                  },
                  {
                    type: "web_url",
                    url: displayUrl,
                    title: "Webview (tall)",
                    messenger_extensions: true,
                    webview_height_ratio: "tall"
                  },
                  {
                    type: "web_url",
                    url: displayUrl,
                    title: "Webview (full)",
                    messenger_extensions: true,
                    webview_height_ratio: "full"
                  }
                ]
              },
              {
                title: "testing",
                subtitle: "123",
              }
            ],
          }
        }
      }
    ]
  });
})

app.get('/show-webview', (request, response) => {
  response.sendFile(__dirname + '/views/index.html');
})

app.post('/broadcast-to-chatfuel', (request, response) => {
  response.json({});
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
