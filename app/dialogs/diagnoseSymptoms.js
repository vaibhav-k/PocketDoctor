const builder = require('botbuilder')
const _ = require('lodash')
const symptoms = require('../../data/symptoms.json')
const diagnosisMale = require('../../data/diagnosisMale.json')
const diagnosisFemale = require('../../data/diagnosisFemale.json')
const proposedSymptomsMale = require('../../data/proposedSymptomsMale.json')
const proposedSymptomsFemale = require('../../data/proposedSymptomsFemale.json')

module.exports = function(bot) {
    bot.dialog('/getSymptoms', [
        function (session, args, next) {
            session.dialogData.arr = session.dialogData.arr||[]
            builder.Prompts.text(session, 'Enter your symptoms please:')
        },
        function(session, results) {
            let msg = results.response
            msg = msg.toLowerCase()

            Object.keys(session.conversationData.symptomsList).forEach((symptom) => {
                if(msg.includes(symptom)) {
                    session.dialogData.arr.push(symptom)
                }
            })
            builder.Prompts.confirm(session, 'Would you like to enter more symptoms?')
        },
        function (session, results) {
            if(results.response) {
                session.replaceDialog('/getSymptoms', { reprompt: true })
            } else {
                session.endDialogWithResult({response: session.dialogData.arr})
            } 
        }
    ]);

    bot.dialog('/getProposedSymptoms', [
        function (session, args, next) {
            if(session.conversationData.sex === 'Male') {
                proposedSymptoms = proposedSymptomsMale
            } else {
                proposedSymptoms = proposedSymptomsFemale
            } 
            let proposedSymptomsJSON = {}
            proposedSymptoms.forEach((symptom)=> {
                let key = Object.keys(symptom)[0]
                proposedSymptomsJSON[key] = symptom[key]
            })
            let proposedArr = []
            let pSymptoms = session.conversationData.patientSymptoms.map((symptom) => {
                return session.conversationData.symptomsList[symptom]
            })
            console.log('pSymptoms = ', pSymptoms)
            let ask = []
            pSymptoms.forEach((symptom)=>{
                if(proposedSymptomsJSON[symptom])
                    proposedSymptomsJSON[symptom].forEach((proposedSymptoms) => {
                        ask.push(proposedSymptoms.Name)
                    }) 
            })
            console.log('ask = ', ask)
            ask.forEach((symptom) => {
                session.send(symptom)
            })
            builder.Prompts.text(session,'Do you also have any of the above symptoms too?')
        },
        function(session, results) {
            let input = results.response.toLowerCase()
            console.log('input = ', input)
            let ret = []
            Object.keys(session.conversationData.symptomsList).forEach((symptom) => {
                if(input.includes(symptom)) {
                    ret.push(symptom)
                }
            }) 
            session.endDialogWithResult({response: ret})
        } 
    ]);


    bot.dialog('/diagnoseSymptoms', [
        function (session, args, next) {
            //session.send('This is diagnoseSymptoms')
            builder.Prompts.choice(session, "Please choose  your gender:", "Male|Female", builder.ListStyle.button)
        },
        function(session, results) {
            session.conversationData.sex = results.response.entity
            session.conversationData.symptomsList = {}
            symptoms.forEach((symptom)=> {
                session.conversationData.symptomsList[symptom["Name"].toLowerCase()] = symptom.ID
            })
            // console.log(session.conversationData.symptomsList)
            session.beginDialog('/getSymptoms')
        },
        function(session, results) {
            session.conversationData.patientSymptoms = results.response
            session.beginDialog('/getProposedSymptoms')
        },
        function(session, results) {
            session.conversationData.patientSymptoms = _.union(session.conversationData.patientSymptoms, results.response)
            console.log('patientSymptoms = ', session.conversationData.patientSymptoms)
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
            let doctors = []
            let diseases = []
            session.conversationData.patientSymptoms.forEach((symptom) => {
                console.log('symptom = ', symptom, session.conversationData.symptomsList[symptom])
                diagnosis[session.conversationData.symptomsList[symptom]].forEach((disease) => {
                    console.log('disease = ', disease)
                    console.log('disease isuue= ', disease.Issue.Name)
                    diseases.push(disease.Issue.Name)  
                    // diseases = _.union(diseases, disease.Issue.Name.toString())
                    disease.Specialisation.forEach((d) => {
                        console.log('d = ', d)
                        doctors = _.union(doctors, [d.Name])
                    })
                })
                // doctors = _.union(doctors, temp)
            })
            diseases = _.uniq(diseases)
            console.log('diseases = ', diseases)
            session.send("**Based on this you may have the following diseases**")
            diseases.forEach((disease) => {
                session.send(disease)
            })
            session.send("**You can consult doctors of following specialization for this:**")
            doctors.forEach((doctor) => {
                session.send(doctor)
            })
            builder.Prompts.confirm(session, "Would you like to diagnose again?")
        },
        function(session, results) {
            if(results.response) {
                session.replaceDialog('/diagnoseSymptoms')
            } else{
                session.send('Thanks!')
		session.endConversation()
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
        "cancel", "How can I help you?", 
        {
            matches: /^cancel$/i,
            confirmPrompt: "This will cancel. Are you sure?"
        }
    )
};
