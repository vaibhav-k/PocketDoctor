module.exports = function(bot) {
    bot.dialog('/fixAppointment', [
        function (session, args, next) {
            session.send('This is fixAppointment')
            session.endDialog()
        }
    ]);
};