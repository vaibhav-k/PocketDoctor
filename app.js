const restify = require('restify');
const builder = require('botbuilder');
require('dotenv-extended').load();

//require dialogs
const dialog = {
    greet: require('./app/dialogs/greet'),
};

// Create chat connector for communicating with the Bot Framework Service
const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

const bot = new builder.UniversalBot(connector, {
    persistConversationData: true
});

var intents = new builder.IntentDialog({
    recognizers: [
        new builder.LuisRecognizer(process.env.LUIS_MODEL_URL)
    ],
    intentThreshold: 0.2,
    recognizeOrder: builder.RecognizeOrder.series
});

intents.matches('greet', '/greet');

bot.dialog('/', intents);
dialog.greet(bot);

bot.dialog('/confused', [
    function (session, args, next) {
        if (session.message.text.trim()) {
            session.endDialog('Sorry, I didn\'t understand you or maybe just lost track of our conversation');
        } else {
            session.endDialog();
        }        
    }
]);

// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());



