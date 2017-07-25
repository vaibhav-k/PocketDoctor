const builder = require('botbuilder')
const symptomsList = require('../../data/bodySubLocationSymptomsMan.json')

let arr = []
module.exports = function(bot) {
    bot.dialog('/getSymptoms', [
        function (session, args, next) {
            builder.Prompts.text(session, 'For me to diagnose you, I need to know what symptoms you are feeling. Please enter one symptom at a time.')
        },
        function(session, results) {
            let msg = results.response.split(' ')
            arr.push(msg.filter((word) => {
                    return symptomsList.includes(word)
                })  
            )
            builder.Prompts.confirm(session, 'Would you like to enter more symptoms?')
        },
        function (session, results) {
            if(results.response) {
                session.replaceDialog('getSymptoms', { reprompt: true })
            } else {
                console.log('arr = ', arr)
                 //back to diagnoseSymptoms
                session.endDialogWithResult({response: arr})
            } 
        }
    ]);
};
