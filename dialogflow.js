const dialogflow = require('dialogflow');
const uuid = require('uuid');


async function runDialogflow(queryText) {
  // A unique identifier for the given session
  const sessionId = uuid.v4();
  const projectId = 'yanitheendcovbot-lovtcl';
  // Create a new session
  const sessionClient = new dialogflow.SessionsClient();
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: queryText,
        // The language used by the client (en-US)
        languageCode: 'en-US',
      },
    },
  };

  // Send request and log result
  const responses = await sessionClient.detectIntent(request);
  console.log('Detected intent');
  const result = responses[0].queryResult;
  // var redirect_to_blocks = result.fulfillmentMessages[0].payload.fields.redirect_to_blocks.listValue.values.map(block => block.stringValue);

  var redirect_to_blocks = result.fulfillmentText.split(',');

  var city_municipality = null;
  var province = null;
  var country = null;
  var region = null;
  if (redirect_to_blocks[0] == "Stat Intro: Randomizer") {
    city_municipality = result.parameters.fields["city-municipality"].stringValue;
    province = result.parameters.fields["provinces"].stringValue;
    country = result.parameters.fields["country"].stringValue;
    region = result.parameters.fields["region"].stringValue;
  } 
  console.log("data received:", city_municipality, province, region, country);
  return {
    redirect_to_blocks, city_municipality, province, country, region
  };

}

module.exports = {
    runDialogflow
}