module.exports = function(bot) {
    bot.dialog('/greet', [
        function (session, args, next) {
            const lastVisit = session.userData.lastVisit;

            session.send(['Hello!', 'Hi there!', 'Hi!']);

            if (!lastVisit) {
                session.send('This is PocketDoctor');
                session.userData = Object.assign({}, session.userData, {
                    lastVisit: new Date()
                });
                session.save();
            } else {
                session.send('Glad you\'re back!');
            }

            session.endDialog('How may I help you?');
        }
    ]);
};
