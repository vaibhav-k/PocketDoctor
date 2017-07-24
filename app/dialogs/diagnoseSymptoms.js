const builder = require('botbuilder');
const symptoms = require('../../data/symptoms.json')
const diagnosisMale = require('../../data/diagnosisMale.json')
const diagnosisFemale = require('../../data/diagnosisFemale.json')

// const getSymptoms = require('./getSymptoms')
let symptomsList = {}
let arr = []
module.exports = function(bot) {
    bot.dialog('/getSymptoms', [
        function (session, args, next) {
            builder.Prompts.text(session, 'Enter your symptoms')
        },
        function(session, results) {
            let msg = results.response
            msg = msg.toLowerCase()
            Object.keys(symptomsList).forEach((symptom) => {
                if(msg.includes(symptom)) {
                    arr.push(symptom)
                }
            })
            builder.Prompts.confirm(session, 'Would you like to enter more symptoms')
        },
        function (session, results) {
            if(results.response) {
                session.replaceDialog('/getSymptoms', { reprompt: true })
            } else {
                session.endDialogWithResult({response: arr})
            } 
        }
    ]);

    bot.dialog('/diagnoseSymptoms', [
        function (session, args, next) {
            session.send('This is diagnoseSymptoms')
            builder.Prompts.choice(session, "Which sex?", "Male|Female", builder.ListStyle.button)
        },
        function(session, results) {
            session.conversationData.sex = results.response.entity
            symptoms.forEach((symptom)=> {
                symptomsList[symptom["Name"].toLowerCase()] = symptom.ID
            })
            // console.log(symptomsList)
            session.beginDialog('/getSymptoms')
        },
        function(session, results) {
            let patientSymptoms = results.response
            console.log('patientSymptoms = ', patientSymptoms)
            //get disease from patientSymptoms here
            let diagnosis = {}
            let sex = session.conversationData.sex
            if(sex === 'Male') {
                diagnosisMale.forEach((symptom) => {
                    symptom = symptom.Male
                    let key = Object.keys(symptom)[0]
                    diagnosis[key] = symptom[key]
                })
            } else {
                diagnosisFemale.forEach((symptom) => {
                    symptom = symptom.Female
                    let key = Object.keys(symptom)[0]
                    diagnosis[key] = symptom[key]
                })
            }
            patientSymptoms.forEach((symptom) => {
                session.send("Based on %s you may have the following diseases", symptom)
                console.log('symptom = ', symptom, symptomsList[symptom])
                let diseases = []
                diagnosis[symptomsList[symptom]].forEach((disease) => {
                    diseases.push(disease.Issue.Name)
                })
                console.log('diseases = ', diseases)
                session.send(diseases)
            })
            builder.Prompts.confirm(session, "Would you like to diagnose again?")
        },
        function(session, results) {
            if(results.results) {
                session.replaceDialog('/diagnoseSymptoms')
            } else{
                session.endDialog()
            }
        },
    ])
    .reloadAction(
        "restart", "Ok. Let's start over.",
        {
            matches: /^start over$/i,
            confirmPrompt: "This will start over. Are you sure?"
        }
    )
    .cancelAction(
        "cancel", "How can I help you.", 
        {
            matches: /^cancel$/i,
            confirmPrompt: "This will cancel. Are you sure?"
        }
    )
};