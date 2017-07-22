const builder = require('botbuilder');
const bodyLocations = require('../../data/bodyLocations.json')
const bodySubLocations = require('../../data/bodySubLocations.json')

let locations = {}
bodyLocations["BodyLocations"].forEach((location)=> {
    locations[location["Name"]] = location["ID"]
})

let subLocations = {}
bodySubLocations.forEach((subLocation)=> {
    let location = Object.keys(subLocation)[0]
    // console.log('location = ', subLocation[location])
    subLocations[location] = subLocation[location]
})
let subLocationJSON = {}

module.exports = function(bot) {
    bot.dialog('/diagnoseFullBody', [
        function (session, args, next) {
            session.send('This is diagnoseFullBody')
            builder.Prompts.number(session, 'What is your year of birth?')
        },
        function (session, results) {
            session.userData.YOB = results.response
            builder.Prompts.choice(session, "What is your sex?", "Man|Woman|Child", builder.ListStyle.button);
        },
        function (session, results) {
            session.userData.sex = results.response.entity
            builder.Prompts.choice(session, "Specify a body location", locations, builder.ListStyle.button);
        },
        function (session, results) {
            session.userData.location = locations[results.response.entity]
            subLocations[session.userData.location].forEach((subLocation) => {
                subLocationJSON[subLocation["Name"]] = subLocation["ID"]
            })
            builder.Prompts.choice(session, "Specify a body sub location", subLocationJSON, builder.ListStyle.button);
        },
        function (session, results) {
            session.userData.subLocation = subLocationJSON[results.response.entity]
            console.log('djlksdjfs = ',session.userData.subLocation)

            session.endDialog()
            // builder.Prompts.choice(session, "Specify a body location", locations, builder.ListStyle.button);
        },
    ]);
};