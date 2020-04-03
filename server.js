// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const geolib = require("geolib");
const fs = require("fs");
const bodyParser = require("body-parser");
const url = require("url");
const requestPromise = require("request-promise");

app.use(bodyParser.urlencoded({extended:false}));

// our default array of dreams
const dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];
var contents = fs.readFileSync("listOfHospitals.json");
// Define to JSON type
const hospitalLocations = JSON.parse(contents);


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
  
  // text style
  // const message = `${name}\n\n${address}\n\n${contact}`;
  // return message;
  
  // gallery style
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
  
  // text style
  // response.json({
  //   messages: [
  //     {text: hospital1},
  //     {text: hospital2},
  //     {text: hospital3},
  //     {text: hospital4},
  //     {text: hospital5},
  //   ]
  // })
  
  // gallery style
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
  const displayUrl = "https://endcov-hospitals-api.herokuapp.com/show-webview";
  response.json({
    messages: [
      {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: 'I hope this is not an urgent need :o. Where are you located right now?',
            buttons: [
              {
                title: "Share Location",
                type: "web_url",
                url: displayUrl,
                messenger_extensions: true,
                webview_height_ratio: "compact",
              },
            ],
          }
        }
      }
    ]
  });
})

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

app.get('/show-webview', (request, response) => {
  response.sendFile(__dirname + '/views/webview.html');
})

app.post('/broadcast-to-chatfuel', (request, response) => {
  
  const curr_lat = request.body.latitude;
  const curr_long = request.body.longitude;
  
  const botId = process.env.CHATFUEL_BOT_ID;
  const chatfuelToken = process.env.CHATFUEL_TOKEN;
  
  const userId = "5e8026ca0d7161441439e92a";
  console.log(request.body.userId);
  const blockName = "Hospitals / Location Results";
  const broadcastApiUrl = `https://api.chatfuel.com/bots/${botId}/users/${userId}/send`;
  
  const query = Object.assign(
    {
    chatfuel_token: chatfuelToken, 
    chatfuel_block_name: blockName,
    }, 
    {
      curr_lat,
      curr_long
    }
  );
  
  const chatfuelApiUrl = url.format({
    pathname: broadcastApiUrl,
    query
  })
  
  const options = {
    uri: chatfuelApiUrl,
    headers: {
      'Content-Type': 'application/json'
    }
  }
  
  requestPromise.post(options)
    .then(()=> {
    console.log("done");
    response.json({});
  })
})

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.json({
    message: "Hello! Stay safe :D",
  });
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
