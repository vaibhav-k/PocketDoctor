module.exports = function(bot) {
    bot.dialog('/diagnoseSymptoms', [
        function (session, args, next) {
            session.send('This is diagnoseSymptoms')
            session.endDialog()
        }
    ]);
};