'use strict';
const Alexa = require('ask-sdk-core');
const https = require('https');

const SKILL_NAME = 'India Covid Tracker';
const WELCOME_MSG = `Welcome to ${SKILL_NAME}. ${SKILL_NAME} can tell you the current Covid-19 cases. Try it!!`;
const HELP_MESSAGE = 'You can say tell me the total covid cases, or, you can say stop... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

const TotalCasesIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'TotalCasesIntent';
    },
    async handle(handlerInput) {
        const response  = await httpGet();
        console.log("Data Received : " + response);
        const data = JSON.parse(response);
        var confirmedCases = data[0].confirmed_cases;
        var activeCases = data[0].active_cases;
        var deathCases = data[0].death_cases;
        var migratedCases = data[0].migrated_cases;
        console.log("Data::" + JSON.stringify(data[0]));
        if (confirmedCases == undefined) {
            return handlerInput.responseBuilder
                .speak("Oops!! Unable to get the stats. Please try again")
                .withSimpleCard("Oops!! Unable to get the stats. Please try again")
                .getResponse();
        }

        const speechText = `Here are the stats. Total cases ${confirmedCases}, active cases ${activeCases}, 
            total deaths ${deathCases} and migrated cases are ${migratedCases} `;
        const cardText = `Total cases: ${confirmedCases}, Active Cases: ${activeCases} \r\n 
        Deaths: ${deathCases}, Migrated Cases: ${migratedCases}`;
        console.log("Sending valid response.");
        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard("India Corona Cases", cardText)
            .getResponse();
    }
};

function httpGet() {
    console.log("In httpGet:::::::");
    return new Promise((resolve, reject) => {
        var req = https.request("https://covid-19india-api.herokuapp.com/country_data", res => {
            res.setEncoding('utf8');
            var responseString = "";

            //accept incoming data asynchronously
            res.on('data', chunk => {
                responseString += chunk;
                console.log("Chunks Data: " + responseString);
            });

            //return the data when streaming is complete
            res.on('end', () => {
                console.log("Final Data: " + responseString);
                resolve(responseString);
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
            reject(err);
        });
        req.end();
    });
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = WELCOME_MSG + HELP_MESSAGE;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(HELP_REPROMPT)
            .withSimpleCard(speechText)
            .getResponse();
    }
};
  
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(HELP_MESSAGE)
            .reprompt(HELP_REPROMPT)
            .withSimpleCard(HELP_MESSAGE)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(STOP_MESSAGE)
            .withSimpleCard(STOP_MESSAGE)
            .withShouldEndSession(true)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        //any cleanup logic goes here
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);

        return handlerInput.responseBuilder
            .speak('Sorry, I can\'t understand the command. Please say again.')
            .reprompt('Sorry, I can\'t understand the command. Please say again.')
            .getResponse();
    },
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        TotalCasesIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();